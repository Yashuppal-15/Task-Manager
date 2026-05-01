package com.taskmanager.module.collaboration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {
    @NotBlank private String content;
    @NotNull private Long taskId;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
}