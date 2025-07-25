import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
            };
        case 'LOGOUT':
            return {
                ...initialState,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = useCallback((user, token) => {
        localStorage.setItem('token', token);
        dispatch({
            type: 'LOGIN',
            payload: { user, token },
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    }, []);

    const updateUser = useCallback((userUpdate) => {
        dispatch({
            type: 'UPDATE_USER',
            payload: userUpdate,
        });
    }, []);

    const value = {
        ...state,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
