import { LineChart,Line } from "recharts";

const data = [{name: 'Page A', uv: 400, pv: 2400, amt: 2400},{name: 'Page B', uv: 200, pv: 1800, amt: 240},{name: 'Page C', uv: 650, pv: 3200, amt: 1500},{name: 'Page D', uv: 1000, pv: 3300, amt: 2200}];

const Home = () :React.ReactNode => {
    return(
        <div>
            <h2>Summary</h2>
            <div id='total'>
                <div id='net-total'>
                    <h3>Net Total</h3>
                    <p>$3,500,000</p>
                </div>
                
                <div id='chart'>
                    <LineChart width={300} height={100}  data={data}>
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </div>
            </div>
            <div id='summary'>
                <div>
                    <h3>Income</h3>
                    <p>$2,500</p>
                </div>
                <div>
                    <h3>Food</h3>
                    <p>$2,500</p>
                </div>
                <div>
                    <h3>Supplies</h3>
                    <p>$2,500</p>
                </div>
                <div>
                    <h3>Others</h3>
                    <p>$2,500</p>
                </div>
            </div>
            <div id='table'>
                    <div>
                        <h2>Transactions</h2>
                        <p>You've had _ incomes and _ expenses today</p>
                    <div>
                        <select>
                            <option>Type</option>
                        </select>
                        <select>
                            <option>Date</option>
                        </select>
                        <button>Add</button>
                    </div>
                    <table>
                        <tr>
                            <td>Today</td>
                        </tr>
                        <tr>
                            <td>Netflix</td>
                            <td>Category</td>
                            <td>Date</td>
                            <td>Cash</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Home