import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="bg-cream-200 text-ink flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-5 py-8 sm:px-8">
        <h1 className="text-h1 font-semibold tracking-[-0.02em]">我的家電</h1>
      </main>
      <Footer />
    </div>
  );
}

export default App;
