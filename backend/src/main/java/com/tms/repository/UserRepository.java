package com.tms.repository;

import com.tms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * UserRepository
 *
 * Spring Data JPA auto-generates SQL queries from method names!
 * You don't need to write SQL manually.
 * JpaRepository<User, Long> means our entity is User and PK type is Long.
 *
 * findByEmail()  -> SELECT * FROM users WHERE email = ?
 * findByRole()   -> SELECT * FROM users WHERE role = ?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByDepartment(String department);
}
