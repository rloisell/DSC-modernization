-- Migration preview: AddExpenseCategoryToWorkItem
ALTER TABLE WorkItems
    ADD COLUMN ExpenseCategoryId CHAR(36) NULL,
    ADD CONSTRAINT FK_WorkItems_ExpenseCategories_ExpenseCategoryId
        FOREIGN KEY (ExpenseCategoryId) REFERENCES ExpenseCategories(Id)
        ON DELETE SET NULL;

-- Index for FK lookup performance
CREATE INDEX IX_WorkItems_ExpenseCategoryId ON WorkItems (ExpenseCategoryId);
