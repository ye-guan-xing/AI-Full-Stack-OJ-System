-- =============================================================================
-- Campus OJ 本地数据库 — 全量表结构（7 张表）
-- 对齐 backend/oj-nest/src/entities/*.entity.ts，TypeORM synchronize=false
-- =============================================================================
--
-- 表清单：
--   user                    用户
--   questions               题目
--   test_points             测试点
--   user_submission_code    提交代码
--   user_submission_record  判题记录
--   comments                评论
--   comment_likes           评论点赞
--
-- 导入：
--   cd backend/oj-nest
--   docker compose up -d mysql redis
--   docker exec -i oj-mysql mysql -uroot -p1234 oj < database/本地构建数据库.sql
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `oj` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `oj`;

DROP TABLE IF EXISTS `comment_likes`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `user_submission_record`;
DROP TABLE IF EXISTS `user_submission_code`;
DROP TABLE IF EXISTS `test_points`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `user`;

-- -----------------------------------------------------------------------------
-- 1. user
-- -----------------------------------------------------------------------------
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL COMMENT '用户 UUID',
  `username` varchar(255) NOT NULL COMMENT '登录名',
  `password` varchar(255) NOT NULL COMMENT 'MD5 密码',
  `roles` varchar(255) DEFAULT NULL COMMENT '角色，如 user / admin',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------------------------
-- 2. questions
-- -----------------------------------------------------------------------------
CREATE TABLE `questions` (
  `id` varchar(255) NOT NULL COMMENT '题目 ID',
  `title` varchar(255) NOT NULL COMMENT '标题',
  `label` varchar(255) DEFAULT NULL COMMENT '标签，逗号分隔，供 AI 推荐',
  `test_point_num` int NOT NULL DEFAULT 0 COMMENT '测试点数量',
  `description` text COMMENT '题面',
  `limited_time` bigint DEFAULT NULL COMMENT '时间限制 ms',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_questions_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表';

-- -----------------------------------------------------------------------------
-- 3. test_points
-- -----------------------------------------------------------------------------
CREATE TABLE `test_points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` varchar(255) NOT NULL COMMENT '所属题目',
  `input` text COMMENT '输入',
  `output` text COMMENT '期望输出',
  `is_sample` tinyint NOT NULL DEFAULT 0 COMMENT '1=样例',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_test_points_question_id` (`question_id`),
  CONSTRAINT `fk_test_points_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测试点表';

-- -----------------------------------------------------------------------------
-- 4. user_submission_code
-- -----------------------------------------------------------------------------
CREATE TABLE `user_submission_code` (
  `id` varchar(36) NOT NULL COMMENT '提交代码 ID',
  `user_id` varchar(255) NOT NULL,
  `question_id` varchar(255) NOT NULL,
  `code` text COMMENT '源代码',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_submission_code_user` (`user_id`),
  KEY `idx_submission_code_question` (`question_id`),
  CONSTRAINT `fk_submission_code_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submission_code_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户提交代码表';

-- -----------------------------------------------------------------------------
-- 5. user_submission_record
-- -----------------------------------------------------------------------------
CREATE TABLE `user_submission_record` (
  `id` varchar(36) NOT NULL COMMENT '判题记录 ID',
  `user_id` varchar(255) NOT NULL,
  `question_id` varchar(255) NOT NULL,
  `code_id` varchar(36) NOT NULL COMMENT '关联 user_submission_code.id',
  `result` varchar(255) DEFAULT NULL COMMENT 'Pending / Accepted / Wrong Answer 等',
  `time` varchar(255) DEFAULT NULL COMMENT '运行时间',
  `memory` varchar(255) DEFAULT NULL COMMENT '内存',
  `language` varchar(255) DEFAULT NULL COMMENT '编程语言',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_submission_record_user` (`user_id`),
  KEY `idx_submission_record_question` (`question_id`),
  KEY `idx_submission_record_code` (`code_id`),
  KEY `idx_submission_record_user_result` (`user_id`, `result`),
  CONSTRAINT `fk_submission_record_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submission_record_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submission_record_code` FOREIGN KEY (`code_id`) REFERENCES `user_submission_code` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='判题结果表';

-- -----------------------------------------------------------------------------
-- 6. comments
-- -----------------------------------------------------------------------------
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `content` text,
  `parent_comment_id` int DEFAULT NULL COMMENT '父评论 ID，NULL 为根评论',
  `question_id` varchar(255) NOT NULL,
  `like_count` int NOT NULL DEFAULT 0,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_comments_question_id` (`question_id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_parent_id` (`parent_comment_id`),
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- -----------------------------------------------------------------------------
-- 7. comment_likes
-- -----------------------------------------------------------------------------
CREATE TABLE `comment_likes` (
  `user_id` varchar(255) NOT NULL,
  `comment_id` int NOT NULL,
  `liked_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_id`, `comment_id`),
  KEY `idx_comment_likes_comment` (`comment_id`),
  CONSTRAINT `fk_comment_likes_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_likes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 可选：演示数据
-- =============================================================================
INSERT INTO `user` (`id`, `username`, `password`, `roles`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'e10adc3949ba59abbe56e05720f883e', 'admin');

INSERT INTO `questions` (`id`, `title`, `label`, `test_point_num`, `description`, `limited_time`) VALUES
('q-demo-a-plus-b', 'A+B 问题', '入门,模拟', 2,
 '给定两个整数 A 和 B，计算并输出 A+B 的值。\n\n输入：一行两个整数，空格分隔。\n输出：一个整数。', 2000);

INSERT INTO `test_points` (`question_id`, `input`, `output`, `is_sample`) VALUES
('q-demo-a-plus-b', '1 2', '3', 1),
('q-demo-a-plus-b', '100 200', '300', 0);
