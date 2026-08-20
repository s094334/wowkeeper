import { BrowserRouter, Route, Routes } from "react-router";
import { AppLayout } from "./components/common/AppLayout";
import { ApplianceDetail } from "./pages/ApplianceDetail";
import { EditAppliance } from "./pages/EditAppliance";
import { NewPart } from "./pages/NewPart";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NewAppliance } from "./pages/NewAppliance";
import { Register } from "./pages/Register";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/appliances/new" element={<NewAppliance />} />
          <Route path="/appliances/:id" element={<ApplianceDetail />} />
          <Route path="/appliances/:id/edit" element={<EditAppliance />} />
          <Route path="/appliances/:id/parts/new" element={<NewPart />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
