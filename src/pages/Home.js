import React from 'react';
import Header from './Header';


function HomePage() {
return (
    <><Header /><div className="page">
        <div className="content">
            <div className="welcome-message">
                <h1>Bem-vindo(a)!</h1>
                <p>Esta é a sua página inicial.</p>
            </div>
        </div>
    </div></>
);
}

export default HomePage;