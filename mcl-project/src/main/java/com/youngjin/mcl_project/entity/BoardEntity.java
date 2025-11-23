package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "board")
public class BoardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idx;

    @Column(name = "member_idx")
    private long memberIdx;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_type", length = 10)
    private BoardType boardType;

    private String title;

    private String content;

    private long hit;

    private long recommend;

    private LocalDateTime regdate;

    private LocalDateTime moddate;

    private String ip;

    @Column(name = "is_deleted")
    private boolean isDeleted;

    public enum BoardType {
        NOTICE, FREE
    }

    // 추천 수 증가
    public void increaseRecommend() {
        this.recommend++;
    }

    // 추천 수 감소 (0보다 작아지지 않게 방어)
    public void decreaseRecommend() {
        if (this.recommend > 0) {
            this.recommend--;
        }
    }
}
