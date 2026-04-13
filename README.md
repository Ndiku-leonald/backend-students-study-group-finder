# Backend - Student Study Group Finder

## Overview
Node.js + Express + Sequelize API for authentication, group management, sessions, invitations, posts, favorites, dashboards, and profile management.

## Tech Stack
- Node.js
- Express 5
- Sequelize ORM
- MySQL
- JWT authentication

## Setup
1. Install dependencies:
   npm install
2. Configure environment in .env:
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=study_group_db
   JWT_SECRET=replace_with_long_random_secret
   FRONTEND_ORIGIN=http://localhost:3001
3. Create database schema:
   - Run database/schema.sql in MySQL
4. Start server:
   npm start

## API Base URL
http://localhost:5000/api

## Main Endpoints
- Auth
  - POST /auth/register
  - POST /auth/login
  - GET /auth/users (admin)
- Users
  - GET /users/me
  - PUT /users/me
  - GET /users/me/groups
  - GET /users/me/sessions/upcoming
- Groups
  - GET /groups
  - GET /groups/recent
  - GET /groups/search
  - GET /groups/:groupId
  - POST /groups/create
  - PUT /groups/:groupId
  - POST /groups/join/:groupId
  - POST /groups/leave/:groupId
  - GET /groups/:groupId/members
  - DELETE /groups/:groupId/members/:userId
  - GET /groups/:groupId/sessions
  - GET /groups/:groupId/posts
  - POST /groups/:groupId/invites
- Sessions
  - POST /sessions/create
  - GET /sessions/group/:groupId
- Posts
  - GET /posts/:groupId
  - POST /posts/:groupId
- Invitations
  - GET /invites
  - GET /invites/pending
  - POST /invites/:invitationId/respond
  - POST /invites/:invitationId/accept
  - POST /invites/:invitationId/reject
- Favorites
  - GET /favorites
  - POST /favorites/:groupId
  - DELETE /favorites/:groupId
- Dashboard
  - GET /dashboard/me
  - GET /dashboard/admin

## Architecture Summary
- routes/: endpoint registration
- controllers/: request handlers and business logic
- models/: Sequelize models and associations
- middleware/: auth and role guards
- config/: database connection
- database/schema.sql: normalized schema with FKs and indexes

## ERD (Text)
- Users 1..* Groups (leader via Groups.userId)
- Users *..* Groups via GroupMembers
- Groups 1..* Sessions
- Groups 1..* Posts; Users 1..* Posts
- Users *..* Groups via Favorites
- Groups 1..* Invitations; Users 1..* Invitations (inviter/invitee)
- AdminAccessCodes used for admin registration/login validation

## Validation and Security Notes
- Password hashing via bcryptjs
- JWT access control via auth middleware
- Role checks for admin routes and leader-only actions
- Basic request validation in controllers

## Test Readiness Checklist
- Register student/admin users
- Login and access protected endpoints
- Create group, join, leave, invite member
- Schedule sessions as group leader
- Create and read group posts as member
- Verify dashboard aggregation endpoints
