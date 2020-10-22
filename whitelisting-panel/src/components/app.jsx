import React from 'react';

import UserContext from '../services/UserContext';

import Main from './main';

const App = () => {
    const [user, setUser] = React.useState(undefined);

    return (
        <main>
            <UserContext.Provider value={{user, setUser}}>
                <Main/>
            </UserContext.Provider>
        </main>
    )
}

export default App;