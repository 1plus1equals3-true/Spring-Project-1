-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        9.3.0 - MySQL Community Server - GPL
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
  `idx` int NOT NULL AUTO_INCREMENT,
  `member_idx` int NOT NULL COMMENT 'FK',
  `board_type` enum('NOTICE','FREE') DEFAULT 'FREE',
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `hit` int DEFAULT '0',
  `recommend` int DEFAULT '0',
  `regdate` datetime NOT NULL,
  `moddate` datetime DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board:~32 rows (대략적) 내보내기
INSERT INTO `board` (`idx`, `member_idx`, `board_type`, `title`, `content`, `hit`, `recommend`, `regdate`, `moddate`, `ip`, `is_deleted`) VALUES
	(1, 8, 'FREE', '안녕하세요', '안녕안녕하세요', 3, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(2, 1, 'NOTICE', '[공지] 테스트 공지사항 입니다.', '안녕안녕하세요', 49, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(3, 1, 'NOTICE', '[공지] 두번째 테스트 공지사항 입니다.', '안녕안녕하세요', 60, 0, '2025-11-19 15:54:28', NULL, NULL, 0),
	(4, 8, 'FREE', '안녕하세요 2', '안녕안녕하세요', 7, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(5, 8, 'FREE', '안녕하세요 3', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(6, 8, 'FREE', '안녕하세요 4', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(7, 8, 'FREE', '안녕하세요 5', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(8, 8, 'FREE', '안녕하세요 6', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', '2025-11-27 16:20:56', NULL, 1),
	(9, 8, 'FREE', '안녕하세요 7', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', '2025-11-27 16:20:56', NULL, 1),
	(10, 8, 'FREE', '안녕하세요 8', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', '2025-11-27 16:20:56', NULL, 1),
	(11, 8, 'FREE', '안녕하세요 9', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', '2025-11-27 16:20:56', NULL, 1),
	(12, 8, 'FREE', '안녕하세요 10', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(13, 8, 'FREE', '안녕하세요 11', '안녕안녕하세요', 5, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(14, 8, 'FREE', '안녕하세요 12', '안녕안녕하세요', 1, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(15, 8, 'FREE', '안녕하세요 13', '안녕안녕하세요', 80, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(16, 8, 'FREE', '안녕하세요 14', '안녕안녕하세요', 3, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(17, 8, 'FREE', '안녕하세요 15', '안녕안녕하세요', 41, 0, '2025-11-20 05:54:28', NULL, NULL, 0),
	(18, 7, 'FREE', '안녕하세요 16', '<p>안녕안녕하세요</p><p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/24755dec-5c67-4603-a3df-9cf5d9226dda.jpg"></p>', 33, 0, '2025-11-20 05:54:28', '2025-11-21 16:20:01', '127.0.0.1', 1),
	(19, 8, 'FREE', '글 작성 테스트', '<p>123</p><p></p><p><strong>123</strong></p><p></p><p><strong><em>123</em></strong></p><p></p><p><u><strong><em>123</em></strong></u></p><p></p><h1>123</h1><p></p><h2>123</h2><p></p><p></p><ul><li><p>123123</p></li><li><p>123</p></li></ul><ol><li><p>123</p></li><li><p>123</p></li><li><p>123</p></li></ol><p><a target="_blank" rel="noopener noreferrer nofollow" class="editor-link" href="https://www.naver.com/">네이버</a></p><p></p>', 64, 0, '2025-11-20 15:01:17', NULL, '127.0.0.1', 0),
	(20, 7, 'FREE', '자유 게시판 게시글 작성 테스트', '<p>테스트</p>', 20, 0, '2025-11-20 16:30:55', NULL, '127.0.0.1', 0),
	(21, 7, 'FREE', '이미지 업로드', '<p>이미지 업로드 테스트</p><p><img class="editor-image" src="https://image.utoimage.com/preview/cp872722/2022/12/202212008462_500.jpg" alt="반려견_강아지 사진 이미지 | 유토이미지 | 상세페이지 | 무료이미지 | 사진 | 22250682"></p>', 42, 0, '2025-11-21 13:08:14', NULL, '127.0.0.1', 0),
	(22, 7, 'FREE', '로컬 이미지 업로드 테스트', '<p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/6215aeb1-4d8d-4663-8f4d-bf1c817bf789.webp"><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/46222a60-54b1-44f6-8eda-c183e97c3e7a.webp"></p>', 25, 0, '2025-11-21 13:16:52', NULL, '127.0.0.1', 0),
	(23, 7, 'FREE', '새로운 로컬 이미지 첨부 테스트', '<p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/21/ba236ccf-9ec0-4462-ac7f-f10ccb3d3271.webp">ㅇㅇ</p>', 41, 0, '2025-11-21 13:54:28', '2025-11-21 15:06:58', '127.0.0.1', 0),
	(24, 7, 'FREE', '123', '<p>123</p>', 12, 0, '2025-11-21 14:17:33', '2025-11-21 16:19:38', '127.0.0.1', 1),
	(25, 7, 'FREE', 'ㅇㄴㅁㅇㅁㄴ', '<p>ㅇㄴㅁㅇㅇㅇ</p>', 24, 0, '2025-11-21 14:51:15', '2025-11-21 16:19:16', '127.0.0.1', 1),
	(26, 9, 'FREE', '잠만보', '<p><img class="editor-image" src="https://localhost:8070/api/images/MCL/board/2025/11/23/1fb875e8-31e4-49a4-a338-44a1cf634a82.png">잠만보</p>', 36, 1, '2025-11-23 02:25:18', NULL, '127.0.0.1', 0),
	(27, 9, 'FREE', '쿠키 만료 후 작성 테스트', '<p>테스트</p>', 239, 2, '2025-11-23 21:17:45', NULL, '127.0.0.1', 0),
	(28, 1, 'NOTICE', '[공지] 공지 공지', '<p>테스트</p>', 16, 0, '2025-11-24 09:39:01', NULL, '127.0.0.1', 0),
	(29, 1, 'FREE', '삭제 예정인 글', '<p>ㅇㅇ<img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/24/41b0b4f4-64bf-4132-816d-7c995278a38f.png"></p>', 8, 1, '2025-11-24 11:16:34', '2025-11-24 11:17:47', '127.0.0.1', 1),
	(30, 11, 'FREE', 'ㅋㅋ문제점 발견 ㅋㅋㅋㅋ', '<p><img class="editor-image" src="https://192.168.0.190:8070/api/images/MCL/board/2025/11/25/a38cf045-1e57-4473-988c-e36bfae38101.png">ㅈㄱㄴ</p>', 31, 0, '2025-11-25 14:07:50', NULL, '127.0.0.1', 0),
	(31, 1, 'FREE', '이미지', '<p></p><p><img class="editor-image" src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?semt=ais_hybrid&amp;w=740&amp;q=80" alt="Robot 이미지 - Freepik에서 무료 다운로드"></p><p><img class="editor-image" src="https://storage.googleapis.com/media-newsinitiative/images/GO801_GNI_VerifyingPhotos_Card2_image3.original.jpg" alt="이미지로 검색하기: 사진 확인. - Google News Initiative"></p><p></p><p></p>', 8, 0, '2025-11-25 14:52:59', NULL, '127.0.0.1', 0),
	(32, 8, 'FREE', '이동 테스트', '<p>이동 테스트</p>', 14, 0, '2025-11-27 10:57:41', NULL, '127.0.0.1', 0);

-- 테이블 mcl_project.board_attachments 구조 내보내기
DROP TABLE IF EXISTS `board_attachments`;
CREATE TABLE IF NOT EXISTS `board_attachments` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `board_idx` int DEFAULT NULL COMMENT 'FK',
  `dir` varchar(200) NOT NULL,
  `stored_name` varchar(200) NOT NULL,
  `original_name` varchar(200) NOT NULL,
  `status` enum('TEMP','ACTIVE') NOT NULL DEFAULT 'TEMP',
  `regdate` datetime NOT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board_attachments:~5 rows (대략적) 내보내기
INSERT INTO `board_attachments` (`idx`, `board_idx`, `dir`, `stored_name`, `original_name`, `status`, `regdate`) VALUES
	(1, 22, '2025/11/21', '6215aeb1-4d8d-4663-8f4d-bf1c817bf789.webp', 'NbwWpZAY7NiMTNeIrCKv8Ov-bNDQqqfDVUCI1C1JIq09NK64iWK1_yXeIvBm7MzqdaatjXZWLwZdXEKS79mxKg.webp', 'ACTIVE', '2025-11-21 13:10:57'),
	(2, 22, '2025/11/21', '46222a60-54b1-44f6-8eda-c183e97c3e7a.webp', 'doro.webp', 'ACTIVE', '2025-11-21 13:16:37'),
	(8, 23, '2025/11/21', 'ba236ccf-9ec0-4462-ac7f-f10ccb3d3271.webp', 'doro.webp', 'ACTIVE', '2025-11-21 15:06:57'),
	(9, 26, '2025/11/23', '1fb875e8-31e4-49a4-a338-44a1cf634a82.png', '80131880_p0.png', 'ACTIVE', '2025-11-23 02:24:53'),
	(11, 30, '2025/11/25', 'a38cf045-1e57-4473-988c-e36bfae38101.png', 'profile.png', 'ACTIVE', '2025-11-25 14:07:33');

-- 테이블 mcl_project.board_comments 구조 내보내기
DROP TABLE IF EXISTS `board_comments`;
CREATE TABLE IF NOT EXISTS `board_comments` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `board_idx` int NOT NULL COMMENT 'FK',
  `member_idx` int NOT NULL,
  `ment` text NOT NULL,
  `regdate` datetime NOT NULL,
  `moddate` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `parent_idx` int DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.board_comments:~12 rows (대략적) 내보내기
INSERT INTO `board_comments` (`idx`, `board_idx`, `member_idx`, `ment`, `regdate`, `moddate`, `is_deleted`, `parent_idx`) VALUES
	(1, 27, 9, '댓글', '2025-11-24 00:27:10', NULL, 0, NULL),
	(2, 27, 9, '댓글 2', '2025-11-24 00:28:01', NULL, 0, NULL),
	(3, 27, 9, '댓글 3\n댓글 3', '2025-11-24 00:28:09', NULL, 0, NULL),
	(4, 27, 7, '@잠만보 답글', '2025-11-24 00:36:36', NULL, 0, 2),
	(5, 27, 7, '댓글 4\n댓글 4\n댓글 4', '2025-11-24 00:37:48', '2025-11-24 00:43:16', 0, NULL),
	(6, 27, 7, '삭제할 댓글 5', '2025-11-24 00:43:35', '2025-11-24 00:43:38', 1, NULL),
	(7, 27, 7, '@버터 삭제된 댓글에 답글?', '2025-11-24 00:48:52', NULL, 0, 6),
	(8, 27, 9, '@버터 이제 안됨', '2025-11-24 01:09:25', NULL, 0, 7),
	(9, 29, 1, '같이 삭제될 댓글', '2025-11-24 11:16:45', NULL, 1, NULL),
	(10, 29, 1, '@관리자 ㅇㅇ', '2025-11-24 11:17:00', NULL, 1, 9),
	(11, 30, 1, '수정함 ㅅㄱ', '2025-11-25 14:18:45', NULL, 0, NULL),
	(12, 27, 12, '@버터 답답글', '2025-11-27 01:13:29', NULL, 0, 4),
	(13, 2, 8, '공지사항에 댓글쓰기', '2025-11-27 14:44:35', '2025-11-27 16:01:29', 1, NULL),
	(14, 3, 8, '또 댓글 쓰기', '2025-11-27 14:45:09', '2025-11-27 16:01:29', 1, NULL),
	(15, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(16, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(17, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(18, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(19, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(20, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(21, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(22, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(23, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(24, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(25, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(26, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(27, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(28, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(29, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(30, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(31, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(32, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(33, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(34, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(35, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(36, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(37, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(38, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(39, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(40, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(41, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(42, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(43, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL),
	(44, 2, 8, '댓글 복사', '2025-11-27 16:04:03', NULL, 0, NULL);

-- 테이블 mcl_project.board_recommend 구조 내보내기
DROP TABLE IF EXISTS `board_recommend`;
CREATE TABLE IF NOT EXISTS `board_recommend` (
  `idx` bigint NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `member_idx` bigint NOT NULL COMMENT '추천한 사람 FK',
  `board_idx` bigint NOT NULL COMMENT '추천된 게시글 FK',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `uk_recommend_member_board` (`member_idx`,`board_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='게시글 추천 로그';

-- 테이블 데이터 mcl_project.board_recommend:~4 rows (대략적) 내보내기
INSERT INTO `board_recommend` (`idx`, `member_idx`, `board_idx`) VALUES
	(13, 9, 27),
	(14, 9, 26),
	(16, 7, 27),
	(17, 1, 29);

-- 테이블 mcl_project.category 구조 내보내기
DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `category` varchar(50) NOT NULL,
  `type` enum('TEXT','SELECT','DATE') NOT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.category:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.category_list 구조 내보내기
DROP TABLE IF EXISTS `category_list`;
CREATE TABLE IF NOT EXISTS `category_list` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `category_idx` int NOT NULL COMMENT 'FK',
  `value` varchar(50) NOT NULL,
  `sort` int DEFAULT '0',
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.category_list:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection 구조 내보내기
DROP TABLE IF EXISTS `collection`;
CREATE TABLE IF NOT EXISTS `collection` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `group_idx` int DEFAULT NULL COMMENT 'FK',
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
  `idx` int NOT NULL AUTO_INCREMENT,
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
  `attachments_idx` int NOT NULL,
  `collection_idx` int NOT NULL,
  PRIMARY KEY (`attachments_idx`,`collection_idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_attachments_mapping:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_category_value 구조 내보내기
DROP TABLE IF EXISTS `collection_category_value`;
CREATE TABLE IF NOT EXISTS `collection_category_value` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `collection_idx` int NOT NULL COMMENT 'FK - 묶어 유니크',
  `category_idx` int NOT NULL COMMENT 'FK - 묶어 유니크',
  `value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE,
  UNIQUE KEY `UQ_collection_category` (`collection_idx`,`category_idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_category_value:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_group 구조 내보내기
DROP TABLE IF EXISTS `collection_group`;
CREATE TABLE IF NOT EXISTS `collection_group` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `title` varchar(100) NOT NULL,
  `description` text,
  `regdate` datetime DEFAULT NULL,
  `moddate` datetime DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_group:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.collection_option 구조 내보내기
DROP TABLE IF EXISTS `collection_option`;
CREATE TABLE IF NOT EXISTS `collection_option` (
  `userid` varchar(50) NOT NULL COMMENT 'FK',
  `quick` tinyint(1) DEFAULT '0',
  `category1` int DEFAULT NULL COMMENT 'category idx',
  `category2` int DEFAULT NULL COMMENT 'category idx',
  PRIMARY KEY (`userid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.collection_option:~0 rows (대략적) 내보내기

-- 테이블 mcl_project.member 구조 내보내기
DROP TABLE IF EXISTS `member`;
CREATE TABLE IF NOT EXISTS `member` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(50) NOT NULL,
  `pwd` varchar(200) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `birth` date DEFAULT NULL,
  `file` varchar(200) DEFAULT NULL,
  `grade` int DEFAULT '1',
  `regdate` datetime NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `provider_id` varchar(50) DEFAULT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idx`) USING BTREE,
  UNIQUE KEY `userid` (`userid`) USING BTREE,
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.member:~11 rows (대략적) 내보내기
INSERT INTO `member` (`idx`, `userid`, `pwd`, `nickname`, `birth`, `file`, `grade`, `regdate`, `provider`, `provider_id`, `refresh_token`) VALUES
	(1, 'admin', '$2a$10$8vlY1lgTHViNBIbrEJ1Pd.Ek5beF3bJjFOrAwSSk9W1ZihTSuB1QW', '관리자', '1955-05-05', 'MCL/profile/20251124/2970cf96-b3e9-4140-96f3-93e28b8e570e.png', 9, '2025-11-24 09:29:07', 'LOCAL', 'admin', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2NDc0Njk3N30.KXiH77jX3HwjR4gsd3qnCGtq36Slk46dJ_c5nDDwFxWGCmXWy5s1gnYfkL1mhEeQmoG1F_zEwgbIQP3i-qKe9g'),
	(2, 'kakao_4512905924', 'SOCIAL_LOGIN', '원현', NULL, 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg', 1, '2025-11-04 16:14:33', 'kakao', '4512905924', NULL),
	(3, 'naver_CSXN8VrgVCR3FHa2IhezYr6JcCDPppy41QxCqvGZ2h8', 'SOCIAL_LOGIN', 'dwdwdwdwdwdw', NULL, 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 1, '2025-11-04 16:16:16', 'naver', 'CSXN8VrgVCR3FHa2IhezYr6JcCDPppy41QxCqvGZ2h8', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDU1hOOFZyZ1ZDUjNGSGEySWhlellyNkpjQ0RQcHB5NDFReENxdkdaMmg4IiwiZXhwIjoxNzYzNjkxNjYzfQ.RnfWvVzrql_cY_YtjUXGDL2wwLhRtR8kCuLbMlay9Su9WZ1fvYbUrkxXxAkjS5UT06MA18QbwPmQKZR3eezcbw'),
	(4, 'hong', '$2a$10$pZX5ONleZmG05.b6BfxnAO1E.qXv1jOA9ReeuBYOplSEv0Ww7s6EG', '홍길동', '2000-02-02', 'MCL/profile/20251111/9b63f6d8-2a0f-492c-b364-9a2ee40ba8ae.webp', 1, '2025-11-11 16:22:51', 'LOCAL', 'hong', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJob25nIiwiZXhwIjoxNzYzOTQ0MDEzfQ.xv90oYM2G53kFHhnJtTA-gSsS9p0nwfCUyZEQRzRmN0BFNX4kXm7F5P5WWxCG6jd3bV3lrbSX0nTlpoMrVvJWw'),
	(5, 'duddj', '$2a$10$7uq9G5SOjMg6/P/h7bU3yegfGEE6UC5KT/d3exQoRkNm/5iKbgBIC', 'english', '2025-11-11', 'MCL/profile/20251111/f2363c77-08d4-4a4d-89d7-e051e4b282ad.png', 1, '2025-11-11 16:58:55', 'LOCAL', 'duddj', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkdWRkaiIsImV4cCI6MTc2NDAyOTM5MX0.uRL1wcp-n4AIMAG2LXmapRsKzQn03O_cWS9CL8y9W_CKNKjOxKeUTRldqM8cP96R4qEbeWti9SDa86klK9VYbw'),
	(6, 'gksrmf', '$2a$10$S6Vc85ILjSpkn9v6mEa/e.qZuaK6rPwZQHAAlGp6NDJ7U8Uybfam.', '세종대왕', '1446-10-09', 'MCL/profile/20251112/f1884226-c2e7-45da-96b5-8c1bc477d751.webp', 1, '2025-11-12 16:23:53', 'LOCAL', 'gksrmf', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJna3NybWYiLCJleHAiOjE3NjM2MjI2NTV9.G4I7EiEvMDLNDL4A7jXr8H_aNFNCF-PollUKvm9QEVt4KU1_Thpy9xjl5sKnxqXy3jUeMPt6P2BAPLEkzHHbOQ'),
	(7, 'butter', '$2a$10$IbESdILW.0HFsSoCq18gA.jGSu5YNbVxhk0SyGtROeIS8alGds6we', '버터', '2022-02-02', 'MCL/profile/20251121/c972364c-775d-4fcf-aac0-99387889f708.webp', 1, '2025-11-13 16:20:54', 'LOCAL', 'butter', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJidXR0ZXIiLCJleHAiOjE3NjQ3NDcxMTV9.TL2_3XFMUQwCWh7v5r4Icopbt2TydWNfabu7NtlP2SCPHtLWtrznMVJieRUAMGbC9lbSA6On0njgeiaUQJUfew'),
	(8, 'testid', '$2a$10$qlE2wH0xGQ9tUuEyIYzcnO5qMBIA08dKWzvsh5kIkYfGxBiBtiCaa', '위베어베어스', '2000-01-01', 'MCL/profile/20251127/35a218de-2ef0-4acc-95a2-9365963ab866.webp', 1, '2025-11-17 09:32:16', 'LOCAL', 'testid', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0aWQiLCJleHAiOjE3NjQ4Mzc4NjF9.WJvLVkNxqQmJN1Kv5U-Nm2hcBbqNrF8QfQ9WlFLoZTizPTMd6fNk02SfwbHnhozOTBAVvuQFx8sbvtjIJjU7tQ'),
	(9, 'wkaaksqh', '$2a$10$.3bLbgHkAHcfGNudmT/qiOZ25RO8Uw8fKC8PmKi9J.aRtWUzClIgy', '잠만보', '2000-01-01', 'MCL/profile/20251123/b0387b5f-ad6e-40fa-bccf-a4211ddbea69.png', 1, '2025-11-23 02:21:37', 'LOCAL', 'wkaaksqh', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3a2Fha3NxaCIsImV4cCI6MTc2NDc3OTY1NH0.d5zkoGL4nWiXA-lZ_oCSTtCKMBsNXmgcY-RRcFQfSFHT_oTcu-iBRFB2xLP0Z_ZNtD7YoIefes_LrOXqnGQfHw'),
	(11, 'erer1', '$2a$10$SRU1uNVLmLekf7MqhtrV1.P5YyhvpYjtu/FidWARhbH9hK4T5qSjS', '명기', '2025-12-01', 'MCL/profile/20251125/63f57dd4-d047-4982-88ae-f0b4bbd1964a.png', 1, '2025-11-25 14:02:00', 'LOCAL', 'erer1', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlcmVyMSIsImV4cCI6MTc2NDY1MTczMH0.mALd5GUxv-wWmDpzwTGnw6YcqZ7C0fNxhUOVxroq-MWqiPlOYFBgz4jrG13u58XZiIshzbQtd77vFk2u35QVKg'),
	(12, 'dkrnahs', '$2a$10$JysVHo2SmQZk56M.mJtdHuI5XrGBwkC0d2ovUf8w2MvmOFzVbzo3C', '아구몬', '1999-03-07', 'MCL/profile/20251126/177a5812-4f8b-4a66-82ed-abb42cf0ff4d.jpg', 1, '2025-11-26 16:36:28', 'LOCAL', 'dkrnahs', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJka3JuYWhzIiwiZXhwIjoxNzY0Nzc5Mzg0fQ.UkttOJFDmC6UoqQuRYV_iB5owxCzuiuLtsby-8fiYsHlH5pTyBoJl6v6Z5Qz_dfsA8Hhys_saCkaiD3ICn7f5A');

-- 테이블 mcl_project.poke_sample 구조 내보내기
DROP TABLE IF EXISTS `poke_sample`;
CREATE TABLE IF NOT EXISTS `poke_sample` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `member_idx` int NOT NULL DEFAULT '0' COMMENT '작성자 ID',
  `pokemon_idx` int NOT NULL COMMENT '전국도감 번호',
  `pokemon_name` varchar(50) NOT NULL COMMENT '표시용 한글 이름 저장',
  `tera_type` varchar(20) NOT NULL COMMENT '테라스탈 타입',
  `item` varchar(50) NOT NULL COMMENT '지닌 도구',
  `nature` varchar(20) NOT NULL COMMENT '성격',
  `ability` varchar(50) NOT NULL COMMENT '특성',
  `ivs` varchar(50) NOT NULL COMMENT '개체값',
  `evs` varchar(50) NOT NULL COMMENT '노력치',
  `move1` varchar(50) NOT NULL,
  `move2` varchar(50) NOT NULL,
  `move3` varchar(50) NOT NULL,
  `move4` varchar(50) NOT NULL,
  `description` text COMMENT '운용법 설명',
  `visibility` enum('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC' COMMENT '공개 여부',
  `regdate` datetime DEFAULT CURRENT_TIMESTAMP,
  `moddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `like_count` int NOT NULL DEFAULT '0' COMMENT '좋아요 수',
  `hit` int NOT NULL DEFAULT '0' COMMENT '조회수',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '삭제 여부',
  PRIMARY KEY (`idx`),
  KEY `idx_pokemon_idx` (`pokemon_idx`),
  KEY `idx_member_idx` (`member_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.poke_sample:~9 rows (대략적) 내보내기
INSERT INTO `poke_sample` (`idx`, `member_idx`, `pokemon_idx`, `pokemon_name`, `tera_type`, `item`, `nature`, `ability`, `ivs`, `evs`, `move1`, `move2`, `move3`, `move4`, `description`, `visibility`, `regdate`, `moddate`, `like_count`, `hit`, `is_deleted`) VALUES
	(1, 1, 25, '피카츄', '페어리', '전기구슬', '조심', '정전기', '6V', 'AS252', '기술1', '기술2', '기술3', '기술4', '대충 사용법', 'PUBLIC', '2025-11-24 15:51:58', '2025-11-25 15:57:26', 0, 7, 1),
	(2, 7, 445, '한카리아스', '강철', '구애머리띠', '명랑', '까칠한피부', '6V', 'H4 A252 S252', '지진', '드래곤 클로', '아이언 헤드', '칼춤', '간단한 설명', 'PUBLIC', '2025-11-24 22:36:37', '2025-11-26 15:05:12', 1, 56, 0),
	(3, 9, 6, '리자몽', '페어리', '목탄', '조심', '선파워', '6V', 'H4 C252 S252', '역린', '지진', '칼춤', '화염방사', '테스트 입력', 'PUBLIC', '2025-11-25 11:39:57', '2025-11-26 16:23:38', 0, 34, 0),
	(4, 1, 25, '피카츄', '비행', '생명의구슬', '조심', 'static', '31/0/31/31/31/31', 'H4 C252 S252', 'volt-switch', 'tera-blast', 'iron-tail', 'bide', '테스트 샘플', 'PUBLIC', '2025-11-25 15:37:34', '2025-11-26 14:59:05', 1, 22, 0),
	(5, 9, 1008, '미라이돈', '비행', '약점보험', '조심', '하드론엔진', '31/31/31/31/31/31', 'H4 C252 S252', '파워젬', '파라볼라차지', '테라버스트', '용성군', '나만 보기 테스트', 'PRIVATE', '2025-11-26 10:28:07', '2025-11-26 23:25:22', 0, 22, 0),
	(6, 9, 999, '모으령', '드래곤', '은빛가루', '차분', '주눅', '0/0/0/0/0/0', '0', '나쁜음모', '나이트헤드', '놀래키기', '대타출동', '', 'PUBLIC', '2025-11-26 10:31:55', '2025-11-27 00:20:50', 0, 26, 0),
	(7, 9, 1024, '테라파고스', '강철', '목탄', '냉정', '테라체인지', '0/0/0/0/0/0', 'H60 A60 B60 C60 D60 S60', '10만볼트', '객기', '고속스핀', '기가임팩트', '', 'PRIVATE', '2025-11-26 10:33:32', '2025-11-26 16:22:35', 0, 77, 0),
	(8, 1, 25, '피카츄', '노말', '자석', '고집', '피뢰침', '31/0/31/31/31/31', 'H252 C252 D4', '10만볼트', '일렉트릭네트', '방전', '방어', '관리자 피카츄', 'PUBLIC', '2025-11-26 16:26:22', '2025-11-27 11:43:17', 1, 64, 0),
	(9, 12, 888, '자시안', '전기', '녹슨검', '명랑', '불요의검', '31/31/31/31/31/31', 'H4 A252 S252', '아이언헤드', '치근거리기', '칼춤', '테라버스트', '최속 AS 자시안', 'PUBLIC', '2025-11-27 01:02:31', '2025-11-27 10:08:06', 0, 16, 0),
	(10, 8, 614, '툰베어', '땅', '약점보험', '명랑', '쓱쓱', '31/31/31/31/31/31', 'H4 A252 S252', '도발', '고드름떨구기', '지진', '절대영도', '', 'PUBLIC', '2025-11-27 09:55:17', '2025-11-27 10:08:04', 0, 10, 0),
	(11, 8, 675, '부란다', '악', '검은띠', '고집', '배짱', '31/31/31/31/31/31', 'H252 A252 B4', '깨트리다', '기충전', '기가임팩트', '도발', '', 'PUBLIC', '2025-11-27 10:44:35', '2025-11-27 10:55:30', 0, 26, 0),
	(12, 8, 217, '링곰', '벌레', '예리한손톱', '고집', '근성', '31/31/31/31/31/31', 'H252 A252 S4', '겁나는얼굴', '객기', '깨물어부수기', '엄청난힘', '', 'PUBLIC', '2025-11-27 13:20:55', '2025-11-27 13:20:56', 0, 2, 0);

-- 테이블 mcl_project.poke_sample_comment 구조 내보내기
DROP TABLE IF EXISTS `poke_sample_comment`;
CREATE TABLE IF NOT EXISTS `poke_sample_comment` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `poke_sample_idx` int NOT NULL COMMENT '어떤 샘플에 달린 댓글인지 (FK)',
  `member_idx` int NOT NULL COMMENT '작성자 (FK)',
  `parent_idx` int DEFAULT NULL COMMENT '대댓글인 경우 부모 댓글 ID',
  `ment` text NOT NULL,
  `regdate` datetime DEFAULT CURRENT_TIMESTAMP,
  `moddate` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idx`) USING BTREE,
  KEY `idx_sample_idx` (`poke_sample_idx`),
  KEY `idx_parent_idx` (`parent_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.poke_sample_comment:~10 rows (대략적) 내보내기
INSERT INTO `poke_sample_comment` (`idx`, `poke_sample_idx`, `member_idx`, `parent_idx`, `ment`, `regdate`, `moddate`, `is_deleted`) VALUES
	(1, 8, 9, NULL, '와! 피카츄!!', '2025-11-26 16:28:26', '2025-11-26 16:29:00', 0),
	(2, 8, 1, 1, '@잠만보 와! 피카츄!!!', '2025-11-26 16:31:18', '2025-11-26 16:31:18', 0),
	(3, 8, 7, 1, '@잠만보 와! 피카츄!!!!', '2025-11-26 16:32:15', '2025-11-26 16:32:15', 0),
	(4, 8, 7, 2, '@관리자 와! 피카츄!!!!!', '2025-11-26 16:32:25', '2025-11-26 16:33:40', 1),
	(5, 8, 12, NULL, '피카츄 나보다 약함', '2025-11-26 16:36:58', '2025-11-26 16:36:58', 0),
	(6, 8, 12, 2, '@관리자 왜 삭제함', '2025-11-26 16:48:45', '2025-11-26 16:48:45', 0),
	(7, 8, 12, NULL, '댓글', '2025-11-27 01:12:11', '2025-11-27 01:12:11', 0),
	(8, 8, 12, 6, '@아구몬 댓글', '2025-11-27 01:12:20', '2025-11-27 01:12:20', 0),
	(9, 8, 12, 8, '@아구몬 댓글', '2025-11-27 01:12:28', '2025-11-27 01:12:28', 0),
	(10, 8, 12, 1, '@잠만보 댓글', '2025-11-27 01:12:45', '2025-11-27 01:12:45', 0);

-- 테이블 mcl_project.poke_sample_like 구조 내보내기
DROP TABLE IF EXISTS `poke_sample_like`;
CREATE TABLE IF NOT EXISTS `poke_sample_like` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `sample_idx` int NOT NULL DEFAULT '0' COMMENT '어떤 샘플 인지',
  `member_idx` int NOT NULL DEFAULT '0' COMMENT '누가 눌렀는지',
  `regdate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idx`) USING BTREE,
  UNIQUE KEY `uq_sample_member` (`sample_idx`,`member_idx`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mcl_project.poke_sample_like:~3 rows (대략적) 내보내기
INSERT INTO `poke_sample_like` (`idx`, `sample_idx`, `member_idx`, `regdate`) VALUES
	(3, 2, 7, '2025-11-24 23:09:49'),
	(6, 4, 9, '2025-11-26 14:58:54'),
	(7, 8, 9, '2025-11-26 17:29:38');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
