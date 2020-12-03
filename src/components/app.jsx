import React from 'react';

import UserContext from '../services/UserContext';

import Main from './main';
import Header from './header';
import MainNav from "./nav";


const App = () => {
    const [user, setUser] = React.useState(undefined);

    return (
        <main>
            <UserContext.Provider value={{user, setUser}}>
                <Header/>
                { user ? <MainNav/> : <></> }
                {
                    user ? 
                    <div className="content"><Main/></div>
                    :
                    <div className="content-no-user"><Main/></div>
                }
                
            </UserContext.Provider>
        </main>
    )
}

export default App;