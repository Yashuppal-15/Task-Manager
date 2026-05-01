package com.taskmanager.module.task.repository;

import com.taskmanager.module.task.entity.Task;
import com.taskmanager.module.task.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
    List<Task> findByDeadlineBeforeAndStatusNot(LocalDate date, TaskStatus status);
}