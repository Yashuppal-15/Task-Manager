package com.taskmanager.module.collaboration.service;

import com.taskmanager.module.auth.entity.User;
import com.taskmanager.module.auth.repository.UserRepository;
import com.taskmanager.module.collaboration.dto.CommentRequest;
import com.taskmanager.module.collaboration.entity.*;
import com.taskmanager.module.collaboration.repository.*;
import com.taskmanager.module.task.entity.Task;
import com.taskmanager.module.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CollaborationService {

    private final TaskCommentRepository commentRepository;
    private final TaskHistoryRepository historyRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public CollaborationService(TaskCommentRepository commentRepository,
                                TaskHistoryRepository historyRepository,
                                TaskRepository taskRepository,
                                UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public TaskComment addComment(CommentRequest req, String userEmail) {
        Task task = taskRepository.findById(req.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        TaskComment comment = new TaskComment();
        comment.setContent(req.getContent());
        comment.setTask(task);
        comment.setUser(user);
        return commentRepository.save(comment);
    }

    public List<TaskComment> getComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    public void logHistory(Long taskId, Long userId, String field, String oldVal, String newVal) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setChangedBy(user);
        history.setField(field);
        history.setOldValue(oldVal);
        history.setNewValue(newVal);
        historyRepository.save(history);
    }

    public List<TaskHistory> getHistory(Long taskId) {
        return historyRepository.findByTaskIdOrderByChangedAtAsc(taskId);
    }
}