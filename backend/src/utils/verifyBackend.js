const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
const http = require("http");

// Configure DNS for MongoDB Atlas
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Load environment variables
dotenv.config();

const app = require("../server");

// Simple HTTP client helper for testing express app without external dependencies
const testRequest = (server, options, body = null) => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const reqOptions = {
      hostname: "127.0.0.1",
      port: address.port,
      path: options.path,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
};

const runAllTests = async () => {
  let server;
  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  [PASS] ${description}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${description}`);
      failedTests++;
    }
  };

  try {
    console.log("\n========================================================");
    console.log("STARTING FULL BACKEND API & RBAC VERIFICATION SUITE");
    console.log("========================================================\n");

    // Wait for MongoDB to be connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once("open", resolve));
    }
    console.log("MongoDB connection verified.\n");

    // Start ephemeral HTTP server on random free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    console.log(`Test server running on port ${port}\n`);

    // ========================================
    // 1. HEALTH & ROOT
    // ========================================
    console.log("--- 1. Health & Root Endpoint Tests ---");
    const rootRes = await testRequest(server, { path: "/" });
    assert(rootRes.status === 200 && rootRes.body.success === true, "GET / returns 200 and API metadata");

    const healthRes = await testRequest(server, { path: "/health" });
    assert(healthRes.status === 200 && healthRes.body.status === "healthy", "GET /health returns 200 healthy");

    // ========================================
    // 2. AUTHENTICATION & LOGIN
    // ========================================
    console.log("\n--- 2. Authentication & Authorization Tests ---");

    // Rejection of unauthenticated protected route
    const unauthRes = await testRequest(server, { path: "/api/auth/me" });
    assert(unauthRes.status === 401 && unauthRes.body.success === false, "Protected route rejects unauthenticated request (401)");

    // Owner Login
    const ownerLogin = await testRequest(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: "owner@teamsync.com", password: "Password123!" }
    );
    assert(ownerLogin.status === 200 && ownerLogin.body.token, "Owner logs in successfully and receives JWT token");
    const ownerToken = ownerLogin.body.token;

    // Member Login
    const memberLogin = await testRequest(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: "member@teamsync.com", password: "Password123!" }
    );
    assert(memberLogin.status === 200 && memberLogin.body.token, "Member logs in successfully");
    const memberToken = memberLogin.body.token;

    // External User Login
    const extLogin = await testRequest(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: "jane@external.com", password: "Password123!" }
    );
    assert(extLogin.status === 200 && extLogin.body.token, "External user logs in successfully");
    const extToken = extLogin.body.token;

    // Invalid Login
    const invalidLogin = await testRequest(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: "owner@teamsync.com", password: "WrongPassword!" }
    );
    assert(invalidLogin.status === 401, "Invalid password correctly rejected (401)");

    // GET /api/auth/me
    const meRes = await testRequest(server, {
      path: "/api/auth/me",
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(meRes.status === 200 && meRes.body.user.email === "owner@teamsync.com", "GET /api/auth/me returns complete user profile");

    // Google Auth endpoint
    const googleAuthRes = await testRequest(
      server,
      { path: "/api/auth/google", method: "POST" },
      { email: "google_dev@example.com", name: "Google Developer", googleId: "gid_999888" }
    );
    assert(googleAuthRes.status === 200 && googleAuthRes.body.token, "Google OAuth authentication works and returns JWT");

    // ========================================
    // 3. USER DIRECTORY & PROFILE
    // ========================================
    console.log("\n--- 3. User Directory & Profile Tests ---");
    const userDir = await testRequest(server, {
      path: "/api/users?search=Sarah",
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      userDir.status === 200 && userDir.body.users.length > 0 && userDir.body.pagination.total >= 1,
      "GET /api/users supports search and paginated response"
    );

    // ========================================
    // 4. WORKSPACE MANAGEMENT & MULTI-TENANT RBAC
    // ========================================
    console.log("\n--- 4. Workspace Management & Multi-Tenant RBAC Tests ---");
    const myWorkspaces = await testRequest(server, {
      path: "/api/workspaces",
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      myWorkspaces.status === 200 && myWorkspaces.body.workspaces.length >= 1,
      "Owner can list their workspaces"
    );
    const workspace1 = myWorkspaces.body.workspaces[0];
    const workspace1Id = workspace1._id;

    // Create a new test workspace
    const newWsRes = await testRequest(
      server,
      { path: "/api/workspaces", method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      { name: "Verification Test Workspace", description: "Temporary workspace for testing" }
    );
    assert(newWsRes.status === 201 && newWsRes.body.workspace.name === "Verification Test Workspace", "Create new workspace returns 201");
    const testWsId = newWsRes.body.workspace._id;

    // Multi-tenant isolation test: External user attempts to access Workspace 1
    const forbiddenWs = await testRequest(server, {
      path: `/api/workspaces/${workspace1Id}`,
      headers: { Authorization: `Bearer ${extToken}` },
    });
    assert(forbiddenWs.status === 403, "MULTI-TENANCY ENFORCED: Non-member rejected with 403 when accessing another workspace");

    // Get Workspace Members
    const wsMembers = await testRequest(server, {
      path: `/api/workspaces/${workspace1Id}/members`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(wsMembers.status === 200 && wsMembers.body.members.length >= 3, "GET /api/workspaces/:id/members returns member list");

    // ========================================
    // 5. PROJECT MANAGEMENT & SEARCH / FILTERS
    // ========================================
    console.log("\n--- 5. Project Management & Filtering Tests ---");

    // Create Project
    const newProj = await testRequest(
      server,
      { path: "/api/projects", method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      {
        name: "Security Audit Project",
        description: "Checking multi-tenant permissions",
        workspaceId: testWsId,
        status: "active",
        priority: "high",
      }
    );
    assert(newProj.status === 201 && newProj.body.project.name === "Security Audit Project", "Create project returns 201");
    const testProjId = newProj.body.project._id;

    // Get Workspace Projects with Pagination & Filters
    const projList = await testRequest(server, {
      path: `/api/projects/workspace/${testWsId}?status=active&priority=high&page=1&limit=10`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      projList.status === 200 &&
      projList.body.projects.length >= 1 &&
      projList.body.pagination.totalCount >= 1,
      "Projects list returns filtered results and pagination metadata"
    );

    // Cross-tenant project access rejection
    const crossProj = await testRequest(server, {
      path: `/api/projects/${testProjId}`,
      headers: { Authorization: `Bearer ${extToken}` },
    });
    assert(crossProj.status === 403, "MULTI-TENANCY ENFORCED: Non-member cannot access project (403)");

    // Update Project
    const updateProj = await testRequest(
      server,
      { path: `/api/projects/${testProjId}`, method: "PUT", headers: { Authorization: `Bearer ${ownerToken}` } },
      { priority: "medium", description: "Updated description" }
    );
    assert(updateProj.status === 200 && updateProj.body.project.priority === "medium", "Update project returns 200");

    // ========================================
    // 6. EPICS
    // ========================================
    console.log("\n--- 6. Epic Management Tests ---");
    const newEpic = await testRequest(
      server,
      { path: "/api/epics", method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      {
        title: "Security Hardening Epic",
        description: "Complete vulnerability review",
        projectId: testProjId,
        status: "in-progress",
      }
    );
    assert(newEpic.status === 201 && newEpic.body.epic.title === "Security Hardening Epic", "Create epic returns 201");
    const testEpicId = newEpic.body.epic._id;

    const epicList = await testRequest(server, {
      path: `/api/epics/project/${testProjId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(epicList.status === 200 && epicList.body.epics.length >= 1, "GET /api/epics/project/:projectId returns epics");

    // ========================================
    // 7. TASKS & WORKSPACE TASK QUERIES
    // ========================================
    console.log("\n--- 7. Task Management & Filters Tests ---");
    const newTask = await testRequest(
      server,
      { path: "/api/tasks", method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      {
        title: "Penetration Testing Task",
        description: "Test all API endpoints for IDOR vulnerabilities",
        projectId: testProjId,
        epicId: testEpicId,
        priority: "high",
        status: "todo",
      }
    );
    assert(newTask.status === 201 && newTask.body.task.title === "Penetration Testing Task", "Create task returns 201");
    const testTaskId = newTask.body.task._id;

    // Get Project Tasks
    const projTasks = await testRequest(server, {
      path: `/api/tasks/project/${testProjId}?status=todo&priority=high`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(projTasks.status === 200 && projTasks.body.tasks.length >= 1, "GET /api/tasks/project/:projectId filters by status & priority");

    // Get Workspace Tasks
    const wsTasks = await testRequest(server, {
      path: `/api/tasks/workspace/${testWsId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(wsTasks.status === 200 && wsTasks.body.tasks.length >= 1, "GET /api/tasks/workspace/:workspaceId returns workspace tasks");

    // Update Task (to completed)
    const updateTask = await testRequest(
      server,
      { path: `/api/tasks/${testTaskId}`, method: "PUT", headers: { Authorization: `Bearer ${ownerToken}` } },
      { status: "completed" }
    );
    assert(updateTask.status === 200 && updateTask.body.task.status === "completed", "Task update to completed works (triggers task_completed activity)");

    // Assign Task
    const assignTask = await testRequest(
      server,
      { path: `/api/tasks/${testTaskId}/assign`, method: "PUT", headers: { Authorization: `Bearer ${ownerToken}` } },
      { userId: ownerLogin.body.user.id }
    );
    assert(assignTask.status === 200 && assignTask.body.task.assignedTo._id.toString() === ownerLogin.body.user.id.toString(), "Task assignment works");

    // ========================================
    // 8. COMMENTS
    // ========================================
    console.log("\n--- 8. Comment Management Tests ---");
    const newComment = await testRequest(
      server,
      { path: "/api/comments", method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      { taskId: testTaskId, text: "Automated verification comment" }
    );
    assert(newComment.status === 201 && newComment.body.comment.text === "Automated verification comment", "Create comment returns 201");
    const testCommentId = newComment.body.comment._id;

    const taskComments = await testRequest(server, {
      path: `/api/comments/task/${testTaskId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(taskComments.status === 200 && taskComments.body.comments.length >= 1, "GET /api/comments/task/:taskId returns comments");

    // Update Comment
    const updateComment = await testRequest(
      server,
      { path: `/api/comments/${testCommentId}`, method: "PUT", headers: { Authorization: `Bearer ${ownerToken}` } },
      { text: "Updated automated verification comment" }
    );
    assert(updateComment.status === 200 && updateComment.body.comment.text === "Updated automated verification comment", "Update comment returns 200");

    // ========================================
    // 9. NOTIFICATIONS
    // ========================================
    console.log("\n--- 9. Notification Tests ---");
    const notifs = await testRequest(server, {
      path: "/api/notifications",
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(notifs.status === 200 && Array.isArray(notifs.body.notifications), "GET /api/notifications returns user notifications");

    const readAllNotifs = await testRequest(
      server,
      { path: "/api/notifications/read-all", method: "PUT", headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    assert(readAllNotifs.status === 200, "Mark all notifications read returns 200");

    // ========================================
    // 10. ACTIVITIES & IDOR PROTECTION
    // ========================================
    console.log("\n--- 10. Activity Log & IDOR Protection Tests ---");
    const wsActivities = await testRequest(server, {
      path: `/api/activities/workspace/${testWsId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(wsActivities.status === 200 && wsActivities.body.activities.length >= 1, "GET /api/activities/workspace/:id returns activities");

    const projActivities = await testRequest(server, {
      path: `/api/activities/project/${testProjId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(projActivities.status === 200 && projActivities.body.activities.length >= 1, "GET /api/activities/project/:id returns project activities");

    // IDOR check on project activities
    const idorProjActivities = await testRequest(server, {
      path: `/api/activities/project/${testProjId}`,
      headers: { Authorization: `Bearer ${extToken}` },
    });
    assert(idorProjActivities.status === 403, "IDOR FIX VERIFIED: External user cannot read project activities (403)");

    // ========================================
    // 11. INVITATIONS
    // ========================================
    console.log("\n--- 11. Invitation System Tests ---");
    const newInvite = await testRequest(
      server,
      { path: `/api/invitations/workspace/${testWsId}`, method: "POST", headers: { Authorization: `Bearer ${ownerToken}` } },
      { email: "fresh_user@example.com", role: "member" }
    );
    assert(newInvite.status === 201 && newInvite.body.inviteToken, "Create workspace invitation returns 201 and token");
    const inviteToken = newInvite.body.inviteToken;

    // View workspace invitations (Admin only)
    const wsInvites = await testRequest(server, {
      path: `/api/invitations/workspace/${testWsId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(wsInvites.status === 200 && wsInvites.body.invitations.length >= 1, "GET /api/invitations/workspace/:workspaceId returns invitations");

    // Inspect invitation token
    const tokenInspect = await testRequest(server, {
      path: `/api/invitations/token/${inviteToken}`,
    });
    assert(tokenInspect.status === 200 && tokenInspect.body.invitation.email === "fresh_user@example.com", "GET /api/invitations/token/:token inspects invite");

    // ========================================
    // 12. REAL ANALYTICS
    // ========================================
    console.log("\n--- 12. Analytics Tests (MongoDB Aggregations) ---");
    const wsAnalytics = await testRequest(server, {
      path: `/api/analytics/workspace/${testWsId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      wsAnalytics.status === 200 &&
      wsAnalytics.body.totalProjects === 1 &&
      wsAnalytics.body.totalTasks === 1 &&
      wsAnalytics.body.completedTasks === 1 &&
      wsAnalytics.body.completionPercentage === 100,
      "Workspace analytics accurately calculates counts, completion percentage, and distribution"
    );

    const projAnalytics = await testRequest(server, {
      path: `/api/analytics/project/${testProjId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      projAnalytics.status === 200 &&
      projAnalytics.body.totalTasks === 1 &&
      projAnalytics.body.completed === 1 &&
      projAnalytics.body.completionPercentage === 100,
      "Project analytics accurately calculates project metrics"
    );

    // Cross-tenant analytics isolation
    const crossWsAnalytics = await testRequest(server, {
      path: `/api/analytics/workspace/${testWsId}`,
      headers: { Authorization: `Bearer ${extToken}` },
    });
    assert(crossWsAnalytics.status === 403, "MULTI-TENANCY ENFORCED: Non-member cannot access workspace analytics (403)");

    // ========================================
    // 13. CASCADE CLEANUPS & DELETIONS
    // ========================================
    console.log("\n--- 13. Cascade Cleanups & Deletions Tests ---");

    // Delete Epic -> Unlink task
    const delEpic = await testRequest(
      server,
      { path: `/api/epics/${testEpicId}`, method: "DELETE", headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    assert(delEpic.status === 200, "Delete epic returns 200");
    const taskAfterEpicDel = await testRequest(server, {
      path: `/api/tasks/${testTaskId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(taskAfterEpicDel.body.task.epic === null, "CASCADE UNLINK VERIFIED: Task epic reference became null after epic deletion");

    // Delete Workspace -> Cascade delete all associated projects, tasks, comments, activities
    const delWs = await testRequest(
      server,
      { path: `/api/workspaces/${testWsId}`, method: "DELETE", headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    assert(delWs.status === 200, "Delete workspace returns 200 and performs cascade cleanup");

    const getDeletedProj = await testRequest(server, {
      path: `/api/projects/${testProjId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(getDeletedProj.status === 404, "CASCADE CLEANUP VERIFIED: Associated project was deleted with workspace");

    const getDeletedTask = await testRequest(server, {
      path: `/api/tasks/${testTaskId}`,
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(getDeletedTask.status === 404, "CASCADE CLEANUP VERIFIED: Associated task was deleted with workspace");

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log("\n========================================================");
    console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("========================================================\n");

    if (failedTests === 0) {
      console.log("ALL BACKEND APIS, RBAC RULES, AND TENANT BOUNDARIES FULLY VERIFIED!\n");
    }

    server.close();
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error("Verification suite encountered an error:", error);
    if (server) server.close();
    process.exit(1);
  }
};

runAllTests();
