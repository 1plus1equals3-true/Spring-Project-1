# mcl_project

```
CREATE TABLE `member` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`pwd` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`nickname` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`birth` DATE NULL DEFAULT NULL,
	`file` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`grade` INT NULL DEFAULT '1',
	`regdate` DATETIME NOT NULL,
	`provider` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`provider_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`refresh_token` VARCHAR(500) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE,
	UNIQUE INDEX `userid` (`userid`) USING BTREE,
	UNIQUE INDEX `nickname` (`nickname`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=9
;

CREATE TABLE `board` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`member_idx` INT NOT NULL COMMENT 'FK',
	`board_type` ENUM('NOTICE','FREE') NULL DEFAULT 'FREE' COLLATE 'utf8mb4_0900_ai_ci',
	`title` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`content` TEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`hit` INT NULL DEFAULT '0',
	`recommend` INT NULL DEFAULT '0',
	`regdate` DATETIME NOT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	`ip` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`is_deleted` TINYINT(1) NULL DEFAULT '0',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=26
;

CREATE TABLE `board_attachments` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`board_idx` INT NULL DEFAULT NULL COMMENT 'FK',
	`dir` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`stored_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`original_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`status` ENUM('TEMP','ACTIVE') NOT NULL DEFAULT 'TEMP' COLLATE 'utf8mb4_0900_ai_ci',
	`regdate` DATETIME NOT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=9
;

CREATE TABLE `board_comments` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`board_idx` INT NOT NULL COMMENT 'FK',
	`member_idx` INT NOT NULL,
	`ment` TEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`regdate` DATETIME NOT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	`is_deleted` TINYINT(1) NOT NULL,
	`parent_idx` INT NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `category` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_0900_ai_ci',
	`category` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`type` ENUM('TEXT','SELECT','DATE') NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `category_list` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`category_idx` INT NOT NULL COMMENT 'FK',
	`value` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`sort` INT NULL DEFAULT '0',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`group_idx` INT NULL DEFAULT NULL COMMENT 'FK',
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_0900_ai_ci',
	`item` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`regdate` DATETIME NULL DEFAULT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_attachments` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NULL DEFAULT NULL COMMENT 'FK' COLLATE 'utf8mb4_0900_ai_ci',
	`dir` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`stored_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`original_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`status` ENUM('temp','active') NOT NULL DEFAULT 'temp' COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_attachments_mapping` (
	`attachments_idx` INT NOT NULL,
	`collection_idx` INT NOT NULL,
	PRIMARY KEY (`attachments_idx`, `collection_idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_category_value` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`collection_idx` INT NOT NULL COMMENT 'FK - 묶어 유니크',
	`category_idx` INT NOT NULL COMMENT 'FK - 묶어 유니크',
	`value` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE,
	UNIQUE INDEX `UQ_collection_category` (`collection_idx`, `category_idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_group` (
	`idx` INT NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_0900_ai_ci',
	`title` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`regdate` DATETIME NULL DEFAULT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_option` (
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_0900_ai_ci',
	`quick` TINYINT(1) NULL DEFAULT '0',
	`category1` INT NULL DEFAULT NULL COMMENT 'category idx',
	`category2` INT NULL DEFAULT NULL COMMENT 'category idx',
	PRIMARY KEY (`userid`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

```
