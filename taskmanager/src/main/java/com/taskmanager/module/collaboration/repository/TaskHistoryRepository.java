package com.taskmanager.module.collaboration.repository;

import com.taskmanager.module.collaboration.entity.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    List<TaskHistory> findByTaskIdOrderByChangedAtAsc(Long taskId);
}