import './App.css';
import Memo from './/memo';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Memo />} />
       </Routes>
    </Router>
  );
}
export default App;
