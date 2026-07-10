const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const dns = require("dns");
const crypto = require("crypto");

// DNS configuration for MongoDB Atlas
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Load environment variables
dotenv.config();

const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const Epic = require("../models/Epic");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const Invitation = require("../models/Invitation");

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Clean existing seed collections
    console.log("Cleaning existing database collections...");
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Project.deleteMany({}),
      Epic.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Invitation.deleteMany({}),
    ]);
    console.log("Collections cleared.");

    // 1. Seed Users
    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    const ownerUser = await User.create({
      name: "Sarah Connor",
      email: "owner@teamsync.com",
      password: hashedPassword,
      role: "owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      provider: "local",
    });

    const adminUser = await User.create({
      name: "John Doe",
      email: "admin@teamsync.com",
      password: hashedPassword,
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      provider: "local",
    });

    const memberUser = await User.create({
      name: "Alex Rivera",
      email: "member@teamsync.com",
      password: hashedPassword,
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      provider: "local",
    });

    const externalUser = await User.create({
      name: "Jane Smith",
      email: "jane@external.com",
      password: hashedPassword,
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      provider: "local",
    });

    console.log(`Seeded 4 users (Default Password: Password123!)`);

    // 2. Seed Workspaces
    console.log("Seeding workspaces...");
    const workspace1 = await Workspace.create({
      name: "Acme Cloud Technologies",
      description: "Primary engineering and product organization",
      owner: ownerUser._id,
      members: [
        { user: ownerUser._id, role: "admin", joinedAt: new Date() },
        { user: adminUser._id, role: "admin", joinedAt: new Date() },
        { user: memberUser._id, role: "member", joinedAt: new Date() },
      ],
    });

    const workspace2 = await Workspace.create({
      name: "Beta Labs Innovations",
      description: "Research & Development workspace",
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: "admin", joinedAt: new Date() },
        { user: memberUser._id, role: "member", joinedAt: new Date() },
      ],
    });

    console.log(`Seeded 2 workspaces.`);

    // 3. Seed Projects
    console.log("Seeding projects...");
    const project1 = await Project.create({
      name: "Enterprise Cloud Migration",
      description: "Migrating legacy core infrastructure to distributed MongoDB cluster",
      workspace: workspace1._id,
      owner: ownerUser._id,
      members: [ownerUser._id, adminUser._id, memberUser._id],
      status: "active",
      priority: "high",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const project2 = await Project.create({
      name: "Mobile App Redesign 3.0",
      description: "Modernizing native mobile applications for iOS and Android",
      workspace: workspace1._id,
      owner: adminUser._id,
      members: [adminUser._id, memberUser._id],
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    const project3 = await Project.create({
      name: "AI Analytics Engine",
      description: "Autonomous reporting and forecasting engine",
      workspace: workspace2._id,
      owner: adminUser._id,
      members: [adminUser._id, memberUser._id],
      status: "active",
      priority: "high",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });

    console.log(`Seeded 3 projects across 2 workspaces.`);

    // 4. Seed Epics
    console.log("Seeding epics...");
    const epic1 = await Epic.create({
      title: "Authentication & RBAC Overhaul",
      description: "Implement fine-grained multi-tenant access control and session management",
      project: project1._id,
      workspace: workspace1._id,
      createdBy: ownerUser._id,
      status: "in-progress",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    const epic2 = await Epic.create({
      title: "Data Pipeline & Aggregation",
      description: "Build high-throughput analytics pipelines with MongoDB aggregation framework",
      project: project1._id,
      workspace: workspace1._id,
      createdBy: adminUser._id,
      status: "planned",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    });

    console.log(`Seeded 2 epics.`);

    // 5. Seed Tasks
    console.log("Seeding tasks...");
    const task1 = await Task.create({
      title: "Implement Multi-Tenant Workspace Authorization",
      description: "Ensure complete tenant isolation so users cannot access unauthorized workspace resources",
      project: project1._id,
      workspace: workspace1._id,
      epic: epic1._id,
      assignedTo: memberUser._id,
      createdBy: ownerUser._id,
      status: "completed",
      priority: "high",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const task2 = await Task.create({
      title: "Build Real-Time Analytics Endpoints",
      description: "Implement MongoDB aggregation pipelines for status and priority metrics",
      project: project1._id,
      workspace: workspace1._id,
      epic: epic2._id,
      assignedTo: adminUser._id,
      createdBy: ownerUser._id,
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    const task3 = await Task.create({
      title: "Review Security & IDOR Protections",
      description: "Verify all project activities and comment operations enforce workspace boundary checks",
      project: project1._id,
      workspace: workspace1._id,
      epic: epic1._id,
      assignedTo: memberUser._id,
      createdBy: adminUser._id,
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    });

    const task4 = await Task.create({
      title: "Draft Mobile UI Wireframes",
      description: "Prepare Figma component library for iOS and Android dark mode",
      project: project2._id,
      workspace: workspace1._id,
      epic: null,
      assignedTo: memberUser._id,
      createdBy: adminUser._id,
      status: "todo",
      priority: "low",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    console.log(`Seeded 4 tasks.`);

    // 6. Seed Comments
    console.log("Seeding comments...");
    await Comment.create({
      task: task1._id,
      user: memberUser._id,
      text: "Completed implementation. All automated tenant isolation checks passing.",
    });

    await Comment.create({
      task: task1._id,
      user: ownerUser._id,
      text: "Great work! Code merged to master.",
    });

    await Comment.create({
      task: task3._id,
      user: adminUser._id,
      text: "Please double-check project activities endpoint for IDOR vulnerability.",
    });

    console.log(`Seeded comments.`);

    // 7. Seed Activities
    console.log("Seeding activities...");
    await Activity.create([
      {
        workspace: workspace1._id,
        user: ownerUser._id,
        action: "workspace_created",
        description: `Workspace "${workspace1.name}" was created`,
      },
      {
        workspace: workspace1._id,
        project: project1._id,
        user: ownerUser._id,
        action: "project_created",
        description: `Project "${project1.name}" was created`,
      },
      {
        workspace: workspace1._id,
        project: project1._id,
        task: task1._id,
        user: memberUser._id,
        action: "task_completed",
        description: `Task "${task1.title}" was completed`,
      },
      {
        workspace: workspace1._id,
        project: project1._id,
        task: task2._id,
        user: ownerUser._id,
        action: "task_assigned",
        description: `Task "${task2.title}" was assigned to John Doe`,
      },
    ]);
    console.log(`Seeded activities.`);

    // 8. Seed Notifications
    console.log("Seeding notifications...");
    await Notification.create([
      {
        recipient: memberUser._id,
        sender: ownerUser._id,
        type: "task_assigned",
        message: `You have been assigned a task: "${task3.title}"`,
        task: task3._id,
        project: project1._id,
        workspace: workspace1._id,
        isRead: false,
      },
      {
        recipient: adminUser._id,
        sender: ownerUser._id,
        type: "task_assigned",
        message: `You have been assigned a task: "${task2.title}"`,
        task: task2._id,
        project: project1._id,
        workspace: workspace1._id,
        isRead: true,
      },
    ]);
    console.log(`Seeded notifications.`);

    // 9. Seed Invitations
    console.log("Seeding invitations...");
    await Invitation.create({
      workspace: workspace1._id,
      invitedBy: ownerUser._id,
      email: "invited_developer@example.com",
      role: "member",
      token: crypto.randomBytes(32).toString("hex"),
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    console.log(`Seeded invitations.`);

    console.log("\n========================================");
    console.log("DATABASE SEED COMPLETED SUCCESSFULLY!");
    console.log("========================================");
    console.log("Test Accounts Available:");
    console.log("1. Owner:  owner@teamsync.com   | Password: Password123!");
    console.log("2. Admin:  admin@teamsync.com   | Password: Password123!");
    console.log("3. Member: member@teamsync.com  | Password: Password123!");
    console.log("4. Other:  jane@external.com    | Password: Password123!");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
