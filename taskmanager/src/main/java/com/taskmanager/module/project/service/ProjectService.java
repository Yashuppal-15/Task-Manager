package com.taskmanager.module.project.service;

import com.taskmanager.module.auth.entity.User;
import com.taskmanager.module.auth.repository.UserRepository;
import com.taskmanager.module.project.dto.ProjectRequest;
import com.taskmanager.module.project.entity.*;
import com.taskmanager.module.project.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public Project create(ProjectRequest req, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = new Project();
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        project.setOwner(owner);
        return projectRepository.save(project);
    }

    public List<Project> getAll() { return projectRepository.findAll(); }

    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public Project update(Long id, ProjectRequest req) {
        Project p = getById(id);
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        return projectRepository.save(p);
    }

    public void delete(Long id) { projectRepository.deleteById(id); }

    public void addMember(Long projectId, Long userId) {
        if (memberRepository.existsByProjectIdAndUserId(projectId, userId))
            throw new RuntimeException("Already a member");
        Project project = getById(projectId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProjectMember pm = new ProjectMember();
        pm.setProject(project);
        pm.setUser(user);
        memberRepository.save(pm);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public List<ProjectMember> getMembers(Long projectId) {
        return memberRepository.findByProjectId(projectId);
    }
}