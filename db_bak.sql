-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        11.8.3-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 mcl_project.board 구조 내보내기
DROP TABLE IF EXISTS `board`;
CREATE TABLE IF NOT EXISTS `board` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `member_idx` int(11) NOT NULL COMMENT 'FK',
  `board_type` enum('NOTICE','FREE') DEFAULT 'FREE',
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `hit` int(11) DEFAULT 0,
  `recommend` int(11) DEFAULT 0,
  `regdate` datetime NOT NULL,
  `moddate` datetime DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board:~27 rows (대략적) 내보내기
INSERT INTO `board` (`idx`, `member_idx`, `board_type`, `title`, `content`, `hit`, `recommend`, `regdate`, `moddate`, `ip`, `is_deleted`) VALUES
	(1, 8, 'FREE', '안녕하세요', '안녕안녕하세요', 3, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(2, 8, 'NOTICE', '[공지] 테스트 공지사항 입니다.', '안녕안녕하세요', 25, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(3, 8, 'NOTICE', '[공지] 두번째 테스트 공지사항 입니다.', '안녕안녕하세요', 41, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(4, 8, 'FREE', '안녕하세요 2', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(5, 8, 'FREE', '안녕하세요 3', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(6, 8, 'FREE', '안녕하세요 4', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(7, 8, 'FREE', '안녕하세요 5', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(8, 8, 'FREE', '안녕하세요 6', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(9, 8, 'FREE', '안녕하세요 7', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(10, 8, 'FREE', '안녕하세요 8', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(11, 8, 'FREE', '안녕하세요 9', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(12, 8, 'FREE', '안녕하세요 10', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(13, 8, 'FREE', '안녕하세요 11', '안녕안녕하세요', 5, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(14, 8, 'FREE', '안녕하세요 12', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(15, 8, 'FREE', '안녕하세요 13', '안녕안녕하세요', 80, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(16, 8, 'FREE', '안녕하세요 14', '안녕안녕하세요', 3, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(17, 8, 'FREE', '안녕하세요 15', '안녕안녕하세요', 41, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(18, 7, 'FREE', '안녕하세요 16', '<p>안녕안녕하세요</p><p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/24755dec-5c67-4603-a3df-9cf5d9226dda.jpg"></p>', 33, 0, '2025-11-20 05:54:28', '2025-11-21 16:20:01', '127.0.0.1', 1),
	(19, 8, 'FREE', '글 작성 테스트', '<p>123</p><p></p><p><strong>123</strong></p><p></p><p><strong><em>123</em></strong></p><p></p><p><u><strong><em>123</em></strong></u></p><p></p><h1>123</h1><p></p><h2>123</h2><p></p><p></p><ul><li><p>123123</p></li><li><p>123</p></li></ul><ol><li><p>123</p></li><li><p>123</p></li><li><p>123</p></li></ol><p><a target="_blank" rel="noopener noreferrer nofollow" class="editor-link" href="https://www.naver.com/">네이버</a></p><p></p>', 56, 0, '2025-11-20 15:01:17', NULL, '127.0.0.1', 0),
	(20, 7, 'FREE', '자유 게시판 게시글 작성 테스트', '<p>테스트</p>', 18, 0, '2025-11-20 16:30:55', NULL, '127.0.0.1', 0),
	(21, 7, 'FREE', '이미지 업로드', '<p>이미지 업로드 테스트</p><p><img class="editor-image" src="https://image.utoimage.com/preview/cp872722/2022/12/202212008462_500.jpg" alt="반려견_강아지 사진 이미지 | 유토이미지 | 상세페이지 | 무료이미지 | 사진 | 22250682"></p>', 32, 0, '2025-11-21 13:08:14', NULL, '127.0.0.1', 0),
	(22, 7, 'FREE', '로컬 이미지 업로드 테스트', '<p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/6215aeb1-4d8d-4663-8f4d-bf1c817bf789.webp"><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/46222a60-54b1-44f6-8eda-c183e97c3e7a.webp"></p>', 23, 0, '2025-11-21 13:16:52', NULL, '127.0.0.1', 0),
	(23, 7, 'FREE', '새로운 로컬 이미지 첨부 테스트', '<p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/ba236ccf-9ec0-4462-ac7f-f10ccb3d3271.webp">ㅇㅇ</p>', 39, 0, '2025-11-21 13:54:28', '2025-11-21 15:06:58', '127.0.0.1', 0),
	(24, 7, 'FREE', '123', '<p>123</p>', 12, 0, '2025-11-21 14:17:33', '2025-11-21 16:19:38', '127.0.0.1', 1),
	(25, 7, 'FREE', 'ㅇㄴㅁㅇㅁㄴ', '<p>ㅇㄴㅁㅇㅇㅇ</p>', 24, 0, '2025-11-21 14:51:15', '2025-11-21 16:19:16', '127.0.0.1', 1),
	(26, 9, 'FREE', '잠만보', '<p><img class="editor-image" src="https://localhost:8070/api/images/MCL/board/2025/11/23/1fb875e8-31e4-49a4-a338-44a1cf634a82.png">잠만보</p>', 30, 1, '2025-11-23 02:25:18', NULL, '127.0.0.1', 0),
	(27, 9, 'FREE', '쿠키 만료 후 작성 테스트', '<p>테스트</p>', 162, 2, '2025-11-23 21:17:45', NULL, '127.0.0.1', 0);

-- 테이블 mcl_project.board_attachments 구조 내보내기
DROP TABLE IF EXISTS `board_attachments`;
CREATE TABLE IF NOT EXISTS `board_attachments` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `board_idx` int(11) DEFAULT NULL COMMENT 'FK',
  `dir` varchar(200) NOT NULL,
  `stored_name` varchar(200) NOT NULL,
  `original_name` varchar(200) NOT NULL,
  `status` enum('TEMP','ACTIVE') NOT NULL DEFAULT 'TEMP',
  `regdate` datetime NOT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board_attachments:~4 rows (대략적) 내보내기
INSERT INTO `board_attachments` (`idx`, `board_idx`, `dir`, `stored_name`, `original_name`, `status`, `regdate`) VALUES
	(1, 22, '2025/11/21', '6215aeb1-4d8d-4663-8f4d-bf1c817bf789.webp', 'NbwWpZAY7NiMTNeIrCKv8Ov-bNDQqqfDVUCI1C1JIq09NK64iWK1_yXeIvBm7MzqdaatjXZWLwZdXEKS79mxKg.webp', 'ACTIVE', '2025-11-21 13:10:57'),
	(2, 22, '2025/11/21', '46222a60-54b1-44f6-8eda-c183e97c3e7a.webp', 'doro.webp', 'ACTIVE', '2025-11-21 13:16:37'),
	(8, 23, '2025/11/21', 'ba236ccf-9ec0-4462-ac7f-f10ccb3d3271.webp', 'doro.webp', 'ACTIVE', '2025-11-21 15:06:57'),
	(9, 26, '2025/11/23', '1fb875e8-31e4-49a4-a338-44a1cf634a82.png', '80131880_p0.png', 'ACTIVE', '2025-11-23 02:24:53');

-- 테이블 mcl_project.board_comments 구조 내보내기
DROP TABLE IF EXISTS `board_comments`;
CREATE TABLE IF NOT EXISTS `board_comments` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `board_idx` int(11) NOT NULL COMMENT 'FK',
  `member_idx` int(11) NOT NULL,
  `ment` text NOT NULL,
  `regdate` datetime NOT NULL,
  `moddate` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `parent_idx` int(11) DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board_comments:~8 rows (대략적) 내보내기
INSERT INTO `board_comments` (`idx`, `board_idx`, `member_idx`, `ment`, `regdate`, `moddate`, `is_deleted`, `parent_idx`) VALUES
	(1, 27, 9, '댓글', '2025-11-24 00:27:10', NULL, 0, NULL),
	(2, 27, 9, '댓글 2', '2025-11-24 00:28:01', NULL, 0, NULL),
	(3, 27, 9, '댓글 3\n댓글 3', '2025-11-24 00:28:09', NULL, 0, NULL),
	(4, 27, 7, '@잠만보 답글', '2025-11-24 00:36:36', NULL, 0, 2),
	(5, 27, 7, '댓글 4\n댓글 4\n댓글 4', '2025-11-24 00:37:48', '2025-11-24 00:43:16', 0, NULL),
	(6, 27, 7, '삭제할 댓글 5', '2025-11-24 00:43:35', '2025-11-24 00:43:38', 1, NULL),
	(7, 27, 7, '@버터 삭제된 댓글에 답글?', '2025-11-24 00:48:52', NULL, 0, 6),
	(8, 27, 9, '@버터 이제 안됨', '2025-11-24 01:09:25', NULL, 0, 7);

-- 테이블 mcl_project.board_recommend 구조 내보내기
DROP TABLE IF EXISTS `board_recommend`;
CREATE TABLE IF NOT EXISTS `board_recommend` (
  `idx` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `member_idx` bigint(20) NOT NULL COMMENT '추천한 사람 FK',
  `board_idx` bigint(20) NOT NULL COMMENT '추천된 게시글 FK',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `uk_recommend_member_board` (`member_idx`,`board_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='게시글 추천 로그';

-- 테이블 데이터 mcl_project.board_recommend:~3 rows (대략적) 내보내기
INSERT INTO `board_recommend` (`idx`, `member_idx`, `board_idx`) VALUES
	(13, 9, 27),
	(14, 9, 26),
	(16, 7, 27);

-- 테이블 mcl_project.category 구조 내보내기
DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `category` varchar(50) NOT NULL,
  `type` enum('TEXT','SELECT','DATE') NOT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.category:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.category_list 구조 내보내기
DROP TABLE IF EXISTS `category_list`;
CREATE TABLE IF NOT EXISTS `category_list` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `category_idx` int(11) NOT NULL COMMENT 'FK',
  `value` varchar(50) NOT NULL,
  `sort` int(11) DEFAULT 0,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.category_list:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection 구조 내보내기
DROP TABLE IF EXISTS `collection`;
CREATE TABLE IF NOT EXISTS `collection` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `group_idx` int(11) DEFAULT NULL COMMENT 'FK',
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `item` varchar(50) NOT NULL,
  `regdate` datetime DEFAULT NULL,
  `moddate` datetime DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_attachments 구조 내보내기
DROP TABLE IF EXISTS `collection_attachments`;
CREATE TABLE IF NOT EXISTS `collection_attachments` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) DEFAULT NULL COMMENT 'FK',
  `dir` varchar(50) NOT NULL,
  `stored_name` varchar(200) NOT NULL,
  `original_name` varchar(200) NOT NULL,
  `status` enum('temp','active') NOT NULL DEFAULT 'temp',
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_attachments:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_attachments_mapping 구조 내보내기
DROP TABLE IF EXISTS `collection_attachments_mapping`;
CREATE TABLE IF NOT EXISTS `collection_attachments_mapping` (
  `attachments_idx` int(11) NOT NULL,
  `collection_idx` int(11) NOT NULL,
  PRIMARY KEY (`attachments_idx`,`collection_idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_attachments_mapping:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_category_value 구조 내보내기
DROP TABLE IF EXISTS `collection_category_value`;
CREATE TABLE IF NOT EXISTS `collection_category_value` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `collection_idx` int(11) NOT NULL COMMENT 'FK - 묶어 유니크',
  `category_idx` int(11) NOT NULL COMMENT 'FK - 묶어 유니크',
  `value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE,
  UNIQUE KEY `UQ_collection_category` (`collection_idx`,`category_idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_category_value:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_group 구조 내보내기
DROP TABLE IF EXISTS `collection_group`;
CREATE TABLE IF NOT EXISTS `collection_group` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `regdate` datetime DEFAULT NULL,
  `moddate` datetime DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_group:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_option 구조 내보내기
DROP TABLE IF EXISTS `collection_option`;
CREATE TABLE IF NOT EXISTS `collection_option` (
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `quick` tinyint(1) DEFAULT 0,
  `category1` int(11) DEFAULT NULL COMMENT 'category idx',
  `category2` int(11) DEFAULT NULL COMMENT 'category idx',
  PRIMARY KEY (`userid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_option:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.member 구조 내보내기
DROP TABLE IF EXISTS `member`;
CREATE TABLE IF NOT EXISTS `member` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL,
  `pwd` varchar(200) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `birth` date DEFAULT NULL,
  `file` varchar(200) DEFAULT NULL,
  `grade` int(11) DEFAULT 1,
  `regdate` datetime NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `provider_id` varchar(50) DEFAULT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE,
  UNIQUE KEY `userid` (`userid`) USING BTREE,
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.member:~8 rows (대략적) 내보내기
INSERT INTO `member` (`idx`, `userid`, `pwd`, `nickname`, `birth`, `file`, `grade`, `regdate`, `provider`, `provider_id`, `refresh_token`) VALUES
	(2, 'kakao_4512905924', 'SOCIAL_LOGIN', '원현', NULL, 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg', 1, '2025-11-04 16:14:33', 'kakao', '4512905924', NULL),
	(3, 'naver_CSXN8VrgVCR3FHa2IhezYr6JcCDPppy41QxCqvGZ2h8', 'SOCIAL_LOGIN', 'dwdwdwdwdwdw', NULL, 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 1, '2025-11-04 16:16:16', 'naver', 'CSXN8VrgVCR3FHa2IhezYr6JcCDPppy41QxCqvGZ2h8', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDU1hOOFZyZ1ZDUjNGSGEySWhlellyNkpjQ0RQcHB5NDFReENxdkdaMmg4IiwiZXhwIjoxNzYzNjkxNjYzfQ.RnfWvVzrql_cY_YtjUXGDL2wwLhRtR8kCuLbMlay9Su9WZ1fvYbUrkxXxAkjS5UT06MA18QbwPmQKZR3eezcbw'),
	(4, 'hong', '$2a$10$pZX5ONleZmG05.b6BfxnAO1E.qXv1jOA9ReeuBYOplSEv0Ww7s6EG', '홍길동', '2000-02-02', 'MCL/profile/20251111/9b63f6d8-2a0f-492c-b364-9a2ee40ba8ae.webp', 1, '2025-11-11 16:22:51', 'LOCAL', 'hong', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJob25nIiwiZXhwIjoxNzYzOTQ0MDEzfQ.xv90oYM2G53kFHhnJtTA-gSsS9p0nwfCUyZEQRzRmN0BFNX4kXm7F5P5WWxCG6jd3bV3lrbSX0nTlpoMrVvJWw'),
	(5, 'duddj', '$2a$10$7uq9G5SOjMg6/P/h7bU3yegfGEE6UC5KT/d3exQoRkNm/5iKbgBIC', 'english', '2025-11-11', 'MCL/profile/20251111/f2363c77-08d4-4a4d-89d7-e051e4b282ad.png', 1, '2025-11-11 16:58:55', 'LOCAL', 'duddj', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkdWRkaiIsImV4cCI6MTc2NDAyOTM5MX0.uRL1wcp-n4AIMAG2LXmapRsKzQn03O_cWS9CL8y9W_CKNKjOxKeUTRldqM8cP96R4qEbeWti9SDa86klK9VYbw'),
	(6, 'gksrmf', '$2a$10$S6Vc85ILjSpkn9v6mEa/e.qZuaK6rPwZQHAAlGp6NDJ7U8Uybfam.', '세종대왕', '1446-10-09', 'MCL/profile/20251112/f1884226-c2e7-45da-96b5-8c1bc477d751.webp', 1, '2025-11-12 16:23:53', 'LOCAL', 'gksrmf', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJna3NybWYiLCJleHAiOjE3NjM2MjI2NTV9.G4I7EiEvMDLNDL4A7jXr8H_aNFNCF-PollUKvm9QEVt4KU1_Thpy9xjl5sKnxqXy3jUeMPt6P2BAPLEkzHHbOQ'),
	(7, 'butter', '$2a$10$IbESdILW.0HFsSoCq18gA.jGSu5YNbVxhk0SyGtROeIS8alGds6we', '버터', '2022-02-02', 'MCL/profile/20251121/c972364c-775d-4fcf-aac0-99387889f708.webp', 1, '2025-11-13 16:20:54', 'LOCAL', 'butter', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJidXR0ZXIiLCJleHAiOjE3NjQ1MTg5MDh9.lxRuE3LXp1xBetmFlIIIjwkUNoWiFYeycJ1knZRMZKQUDgAzfrBJJ0uBWQCrxgDSt4PyIZ9ZZ2YpQNt1esH6HQ'),
	(8, 'testid', '$2a$10$qlE2wH0xGQ9tUuEyIYzcnO5qMBIA08dKWzvsh5kIkYfGxBiBtiCaa', '아이스베어', '2000-01-01', 'MCL/profile/20251118/4a425373-44a2-4128-b904-961e126dfeaa.jpg', 1, '2025-11-17 09:32:16', 'LOCAL', 'testid', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0aWQiLCJleHAiOjE3NjQyODk2NTF9.g38acTlz7vFx66BVisvPoLZ9QMG6KtjrmXMW38uzlfBPC_6M7-8zQCby8WU1TlRK_zQw_zwKkQyMxLH5JSbDVA'),
	(9, 'wkaaksqh', '$2a$10$.3bLbgHkAHcfGNudmT/qiOZ25RO8Uw8fKC8PmKi9J.aRtWUzClIgy', '잠만보', '2000-01-01', 'MCL/profile/20251123/b0387b5f-ad6e-40fa-bccf-a4211ddbea69.png', 1, '2025-11-23 02:21:37', 'LOCAL', 'wkaaksqh', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3a2Fha3NxaCIsImV4cCI6MTc2NDUxODkxNX0.XQB2WhrzQ3mMgv8kY9QHQTGOVbC2hEb5C-ovJECRZSDYSDn8VvxjQWeErsBI4q9d-7E7j0HmRtUWje-iZMXP_w');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
