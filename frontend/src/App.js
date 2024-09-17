import './App.css';
import Main from './/main';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
       </Routes>
    </Router>
  );
}
export default App;
