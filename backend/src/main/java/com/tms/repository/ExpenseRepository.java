package com.tms.repository;

import com.tms.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

/**
 * ExpenseRepository
 *
 * Handles expense listing and aggregation queries.
 * The SUM query calculates total expenses for a travel request.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTravelRequestId(Long requestId);
    List<Expense> findByCategory(String category);

    // Calculate total expenses for a request
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.travelRequest.id = :requestId")
    BigDecimal sumAmountByRequestId(@Param("requestId") Long requestId);
}
