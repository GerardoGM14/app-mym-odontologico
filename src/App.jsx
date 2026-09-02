import './index.css'; // 👈 aquí importas los estilos globales de Tailwind
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Login from './pages/Login';
//import Register from './pages/Register';
//import Home from './pages/Home';
//import Perfil from './pages/Perfil';


function App() {
  return <Outlet />;
}

export default App;
