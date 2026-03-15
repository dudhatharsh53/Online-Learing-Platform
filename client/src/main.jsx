import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import store from './redux/store.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                {/* Global toast notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            background: '#1e293b',
                            color: '#f1f5f9',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
)
