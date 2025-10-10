import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { LineChart, Line } from "recharts";

type Params = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDesc: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  submitHandler: (event: React.FormEvent, id?: string) => {};
};
type userTokens = {
  accessToken: string;
  refreshToken: string;
};
type expenses = {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const dateFormatter = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

const data = [
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 200, pv: 1800, amt: 240 },
  { name: "Page C", uv: 650, pv: 3200, amt: 1500 },
  { name: "Page D", uv: 1000, pv: 3300, amt: 2200 },
];

const AddExpense = ({
    title,
    setTitle,
    description,
    setDesc,
    category,
    setCategory,
    amount,
    setAmount,
    submitHandler,
  }: Params): React.ReactNode => {
    return (
      <form onSubmit={(event) => submitHandler(event)} id="Add">
        <h1>Add expense</h1>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <br />
        <label htmlFor="desc">Description</label>
        <input
          type="text"
          id="desc"
          value={description}
          onChange={(event) => setDesc(event.target.value)}
        />
        <br />
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <br />
        <label htmlFor="amount">Amount</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(event) => setAmount(Number.parseInt(event.target.value))}
        />
        <br />
        <button id="submit" type="submit">
          Submit
        </button>
      </form>
    );
  },
  UpdateExpense = ({
    title,
    setTitle,
    description,
    setDesc,
    category,
    setCategory,
    amount,
    setAmount,
    submitHandler,
  }: Params): React.ReactNode => {
    return (
      <form onSubmit={(event) => submitHandler(event)} id="Add">
        <h1>Update expense</h1>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <br />
        <label htmlFor="desc">Description</label>
        <input
          type="text"
          id="desc"
          value={description}
          onChange={(event) => setDesc(event.target.value)}
        />
        <br />
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <br />
        <label htmlFor="amount">Amount</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(event) => setAmount(Number.parseInt(event.target.value))}
        />
        <br />
        <button id="submit" type="submit">
          Submit
        </button>
      </form>
    );
  };

const Home = (): React.ReactNode => {
  const [userTokens, setTokens] = useState<userTokens>(),
    [addVisible, setAVisible] = useState<boolean>(false),
    [updateVisible, setUVisible] = useState<boolean>(false),
    [expenses, setExpenses] = useState<expenses[]>([]),
    [expensesTotal, setTotal] = useState<number>(0),
    [expenseCategories, setCategories] = useState<
      { title: string; amount: number }[]
    >([]),
    [expenseId, setEId] = useState<string>(""),
    date = new Date();

  const [title, setTitle] = useState<string>(""),
    [description, setDesc] = useState<string>(""),
    [category, setCategory] = useState<string>(""),
    [amount, setAmount] = useState<number>(0);

  const [success, setSuccess] = useState<boolean>(false),
    [successMsg, setSMessages] = useState<string>(),
    [error, setError] = useState<boolean>(false),
    [errorMessages, setEMessages] = useState<string[]>([]);

  const expenseFetch = async (): Promise<void> => {
    if (userTokens) {
      try {
        let expenseFetch: Response = await fetch(
            "http://localhost:3000/expenses/getall",
            {
              method: "GET",
              headers: {
                Authorization: userTokens.accessToken,
              },
            }
          ),
          expenseResponse = await expenseFetch.json();

        if (expenseFetch.status == 200) {
          if (Array.isArray(expenseResponse.message))
            setExpenses(() => [...expenseResponse.message]);
        } else {
          setError(true);
          setEMessages((msgs) => [...msgs, expenseResponse.message]);
        }
      } catch (error) {
        setError(true);
        setEMessages((msgs) => [...msgs, (error as Error).message]);
      }
    } else {
      setError(true);
      setEMessages((msgs) => [...msgs, "You need to authenticate yourself"]);
    }
  };

  useEffect(() => {
    const tokens = localStorage.getItem("userTokens");

    if (tokens) setTokens(JSON.parse(tokens));
  }, []);

  useEffect(() => {
    (async () => await expenseFetch())();
  }, [userTokens]);

  useEffect(() => {
    if (expenses.length > 0) {
      let total = 0;
      expenses.forEach((expense) => (total += expense.amount));
      setTotal(total);

      setCategories(() => {
        if (expenses.length > 0) {
          return expenses.map((expense) => {
            let categoryFinder = expenseCategories.find(
              (category) => category.title == expense.category
            );

            if (!categoryFinder) {
              let categoryTotal = 0;

              expenses.forEach((expenseF) => {
                if (expenseF.category == expense.category)
                  categoryTotal += expenseF.amount;
              });

              return {
                title: expense.category,
                amount: categoryTotal,
              };
            } else return categoryFinder;
          });
        } else return [];
      });
    }
  }, [expenses]);

  useEffect(() => {
    let errorTimeout: NodeJS.Timeout, successTimeout: NodeJS.Timeout;

    if (error)
      errorTimeout = setTimeout(() => {
        setError(false);
        setEMessages([]);
      }, 2500);
    if (success)
      successTimeout = setTimeout(() => {
        setSuccess(false);
        setSMessages("");
      }, 1500);

    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, [error, success]);

  const addSubmitHandler = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!userTokens) {
        setError(true);
        setEMessages((msgs) => [...msgs, "Authenticate yourself first"]);
      } else {
        try {
          const expCreateRequest: Response = await fetch(
              "http://localhost:3000/expenses/add",
              {
                method: "POST",
                headers: {
                  Authorization: userTokens.accessToken,
                },
                body: JSON.stringify({
                  title,
                  description: description,
                  category,
                  amount,
                  createdAt: dateFormatter(date),
                  updatedAt: dateFormatter(date),
                }),
              }
            ),
            expCreateResponse = await expCreateRequest.json();

          if (expCreateRequest.status == 201) await expenseFetch();
          else {
            setError(true);
            setEMessages((msgs) => [...msgs, expCreateResponse.message]);
          }

          setTitle("");
          setDesc("");
          setCategory("");
          setAmount(0);
        } catch (error) {
          setError(true);
          setEMessages((msgs) => [...msgs, (error as Error).message]);
        }
      }
    },
    updateSubmitHandler = async (event: React.FormEvent) => {
      event.preventDefault();

      let inputData = { title, description, category, amount },
        details: Record<string, string | number> = {};

      for (let pair of Object.entries(inputData))
        if (pair[0].length > 0 && pair[1].toString().length > 0) {
          if (pair[0] == "amount" && (pair[1] as number) <= 0) continue;
          details[pair[0]] = pair[1];
        }

      try {
        if (userTokens?.accessToken && expenseId) {
          const updateExpenseRequest = await fetch(
              `http://localhost:3000/expenses/update/${expenseId}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: userTokens.accessToken,
                },
                body: JSON.stringify(details),
              }
            ),
            updateExpenseResponse = await updateExpenseRequest.json();

          if (updateExpenseRequest.status) {
            setSuccess(true);
            setSMessages("Expense updated successfully");
            await expenseFetch();
          } else {
            setError(true);
            setSuccess(false);
            setEMessages((msgs) => [...msgs, updateExpenseResponse.message]);
          }
        }
      } catch (error) {
        setError(true);
        setEMessages((errors) => [...errors, (error as Error).message]);
      }
    },
    deleteHandler = async (expenseId: string) => {
      if (userTokens && expenseId.length > 0) {
        try {
          const deleteRequest: Response = await fetch(
              `http://localhost:3000/expenses/delete/${expenseId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: userTokens.accessToken,
                },
              }
            ),
            deleteResponse = await deleteRequest.json();
          console.log(deleteRequest.status);
          console.log(deleteResponse);
          if (deleteRequest.status == 204) {
            setSuccess(true);
            setSMessages("Expense deleted successfully");
          } else {
            setError(true);
            setEMessages((msgs) => [...msgs, deleteResponse.message]);
          }
        } catch (error) {
          console.log("here");
          setError(true);
          setEMessages((msgs) => [...msgs, (error as Error).message]);
        }
      } else {
        setError(true);
        setEMessages((msgs) => [
          ...msgs,
          "Ensure to authenticate yourself first",
        ]);
      }
    };

  return (
    <div id="Home">
      <h2>Summary</h2>
      <div id="total">
        <div id="net-total">
          <h3>Expenses Total</h3>
          <p>{expensesTotal}</p>
        </div>
        <div id="chart">
          <LineChart width={300} height={100} data={data}>
            <Line
              type="monotone"
              dataKey="pv"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </div>
      <div id="summary">
        {expenseCategories.map((category, index) => (
          <div key={index}>
            <h3>{category.title}</h3>
            <p>{category.amount}</p>
          </div>
        ))}
      </div>
      <div id="table">
        <div>
          <button
            style={{ position: "relative", left: "78.5%" }}
            onClick={() => setAVisible(!addVisible)}
          >
            Add
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <td>Title</td>
              <td>Description</td>
              <td>Amount</td>
              <td>Category</td>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 &&
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td>{expense.description}</td>
                  <td>${expense.amount}</td>
                  <td>{expense.category}</td>
                  <td
                    onClick={() => {
                      if (addVisible) setAVisible(false);
                      setUVisible(!updateVisible);
                      setEId(expense.id);
                    }}
                  >
                    Update
                  </td>
                  <td onClick={() => deleteHandler(expense.id)}>Delete</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {addVisible && !updateVisible && (
        <AddExpense
          title={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDesc={setDesc}
          amount={amount}
          setAmount={setAmount}
          submitHandler={addSubmitHandler}
        />
      )}
      {updateVisible && !addVisible && (
        <UpdateExpense
          title={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDesc={setDesc}
          amount={amount}
          setAmount={setAmount}
          submitHandler={updateSubmitHandler}
        />
      )}
      {error && errorMessages.map((msg, index) => <p key={index}>{msg}</p>)}
      {success && <p>{successMsg}</p>}
    </div>
  );
};

export default Home;
