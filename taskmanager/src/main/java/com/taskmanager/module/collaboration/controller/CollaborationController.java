package com.taskmanager.module.collaboration.controller;

import com.taskmanager.module.collaboration.dto.CommentRequest;
import com.taskmanager.module.collaboration.entity.*;
import com.taskmanager.module.collaboration.service.CollaborationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {

    private final CollaborationService collaborationService;

    public CollaborationController(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @PostMapping("/comments")
    public ResponseEntity<TaskComment> addComment(@Valid @RequestBody CommentRequest req,
                                                  Authentication auth) {
        return ResponseEntity.ok(collaborationService.addComment(req, auth.getName()));
    }

    @GetMapping("/comments/{taskId}")
    public ResponseEntity<List<TaskComment>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(collaborationService.getComments(taskId));
    }

    @GetMapping("/history/{taskId}")
    public ResponseEntity<List<TaskHistory>> getHistory(@PathVariable Long taskId) {
        return ResponseEntity.ok(collaborationService.getHistory(taskId));
    }
}