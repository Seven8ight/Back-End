# Expense Tracker CLI Application

Originated from roadmap.sh backend projects

## Setup

1. Install all required node modules

```bash
    npm i -g
```

2. Link the CLI application

```bash
    npm link
```

3. Execute

```bash
    Expense-Tracker <commands>
```

## Execution

1. To add an expense

```bash
    Expense-Tracker --add description="Expense 1" amount=2500 category="Test" month="January"
```

_Category and month are optional_

2. To list all expenses

```bash
    Expense-Tracker list
```

3. To list expenses via a filter

```bash
    Expense-Tracker list type=<month,category> <month,category>=<filter>
```

4. To update an expense

```bash
    Expense-Tracker --update id=1 description="Expense 2000"
```

**Id is compulsory**, all other properties are optional for change

5. To delete an expense

```bash
    Expense-Tracker --delete <id>
```

6. To export into csv

```bash
    Expense-Tracker export
```

7. To set a budget

```bash
    Expense-Tracker --budget set=<amount>
```

8. To update the current set budget

```bash
    Expense-Tracker --budget update=<new amount>
```

9. Reveal a summary of expenses

```bash
    Expense-Tracker --budget summary
```
