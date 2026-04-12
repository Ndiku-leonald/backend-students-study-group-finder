-- Study Group Finder MySQL rebuild script
-- This script drops and recreates the schema so the database is fully in sync.

DROP DATABASE IF EXISTS study_group_db;

CREATE DATABASE study_group_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_group_db;

CREATE TABLE Users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  program VARCHAR(255),
  year INT,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  adminCode VARCHAR(10),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_adminCode (adminCode)
) ENGINE=InnoDB;

CREATE TABLE AdminAccessCodes (
  code VARCHAR(10) NOT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code)
) ENGINE=InnoDB;

INSERT INTO AdminAccessCodes (code, isActive) VALUES
('x01', 1),
('x02', 1),
('x03', 1),
('x04', 1),
('x05', 1),
('x06', 1),
('x07', 1),
('x08', 1),
('x09', 1),
('x10', 1),
('x11', 1),
('x12', 1),
('x13', 1),
('x14', 1),
('x15', 1),
('x16', 1),
('x17', 1),
('x18', 1),
('x19', 1),
('x20', 1),
('x21', 1),
('x22', 1),
('x23', 1),
('x24', 1),
('x25', 1),
('x26', 1),
('x27', 1),
('x28', 1),
('x29', 1),
('x30', 1),
('x31', 1),
('x32', 1),
('x33', 1),
('x34', 1),
('x35', 1),
('x36', 1),
('x37', 1),
('x38', 1),
('x39', 1),
('x40', 1),
('x41', 1),
('x42', 1),
('x43', 1),
('x44', 1),
('x45', 1),
('x46', 1),
('x47', 1),
('x48', 1),
('x49', 1),
('x50', 1);

CREATE TABLE Groups (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  course VARCHAR(255),
  faculty VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  userId INT UNSIGNED,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_groups_userId (userId),
  CONSTRAINT fk_groups_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  groupId INT UNSIGNED NOT NULL,
  date DATETIME,
  time VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_groupId (groupId),
  CONSTRAINT fk_sessions_group
    FOREIGN KEY (groupId) REFERENCES Groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Favorites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  groupId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_group (userId, groupId),
  KEY idx_favorites_groupId (groupId),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_group
    FOREIGN KEY (groupId) REFERENCES Groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  groupId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_groupId (groupId),
  KEY idx_posts_userId (userId),
  CONSTRAINT fk_posts_group
    FOREIGN KEY (groupId) REFERENCES Groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_posts_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE GroupMembers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  groupId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_group_members_user_group (groupId, userId),
  KEY idx_group_members_userId (userId),
  CONSTRAINT fk_group_members_group
    FOREIGN KEY (groupId) REFERENCES Groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_group_members_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Invitations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  groupId INT UNSIGNED NOT NULL,
  inviterId INT UNSIGNED NOT NULL,
  inviteeId INT UNSIGNED NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invitations_group_invitee (groupId, inviteeId),
  KEY idx_invitations_groupId (groupId),
  KEY idx_invitations_inviteeId (inviteeId),
  CONSTRAINT fk_invitations_group
    FOREIGN KEY (groupId) REFERENCES Groups(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_invitations_inviter
    FOREIGN KEY (inviterId) REFERENCES Users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_invitations_invitee
    FOREIGN KEY (inviteeId) REFERENCES Users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;
