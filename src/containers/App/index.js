import { Suspense, lazy } from "react"
import { SemipolarLoading } from "react-loadingg"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Dashboard = lazy(() => import("containers/Dashboard"))

const App = () => (
  <Suspense fallback={<SemipolarLoading />}>
    <Dashboard />
    <ToastContainer/>
  </Suspense>
)

export default App
