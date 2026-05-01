package com.taskmanager.module.task.service;

import com.taskmanager.module.auth.entity.User;
import com.taskmanager.module.auth.repository.UserRepository;
import com.taskmanager.module.project.entity.Project;
import com.taskmanager.module.project.repository.ProjectRepository;
import com.taskmanager.module.task.dto.TaskRequest;
import com.taskmanager.module.task.entity.*;
import com.taskmanager.module.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Task create(TaskRequest req, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setProject(project);
        task.setCreatedBy(creator);
        task.setStatus(req.getStatus() != null ? req.getStatus() : TaskStatus.PENDING);
        task.setPriority(req.getPriority() != null ? req.getPriority() : TaskPriority.MEDIUM);
        task.setDeadline(req.getDeadline());

        if (req.getAssignedToId() != null) {
            User assignee = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignedTo(assignee);
        }
        return taskRepository.save(task);
    }

    public List<Task> getByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getMyTasks(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public List<Task> getOverdue() {
        return taskRepository.findByDeadlineBeforeAndStatusNot(LocalDate.now(), TaskStatus.COMPLETED);
    }

    public Task updateStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public Task update(Long id, TaskRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setPriority(req.getPriority());
        task.setDeadline(req.getDeadline());
        if (req.getAssignedToId() != null) {
            User assignee = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignedTo(assignee);
        }
        return taskRepository.save(task);
    }

    public void delete(Long id) { taskRepository.deleteById(id); }
}