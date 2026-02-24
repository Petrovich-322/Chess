import Board from "./Board";

const connect = async () => {
    const response = await fetch('/api/new-game');
    const text = await response.json();
    console.log(text);  
}

connect();
const App = () => {

  return (
    <Board />
  )
}

export default App;
