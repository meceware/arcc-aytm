import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class PageHome extends Component {
  generateRandomString( length ) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < length; i++ ) {
      text += possible.charAt( Math.floor( Math.random() * possible.length ) );
    }
    return text;
  }

  componentDidMount() {
    // Page title
    const titleTag = document.getElementsByTagName( 'title' )[ 0 ];
    titleTag.innerHTML = 'ARCC &bull; Collaborative Code Editor';
  }

  render() {
    return (
      <div className = 'bg-code block relative w-full h-full bg-center bg-no-repeat bg-cover'>
        <div className = 'flex items-center justify-center h-screen bg-gray-900 bg-opacity-80'>
          <div className = 'block p-12 w-full text-center leading-loose text-gray-200'>
            <div>
              <h1 className = 'font-bold text-4xl leading-loose'>ARCC</h1>
            </div>
            <p className = 'text-gray-300 text-xl leading-loose'>A real-time collaborative code editor</p>
            <div className = 'block my-6'>
              <Link className = 'bg-transparent hover:bg-blue-400 hover:bg-opacity-20 font-semibold text-gray-200 hover:text-white py-2 px-8 border border-gray-200 rounded transition duration-300 ease-in-out' to = { `/code/${ this.generateRandomString( 20 ) }` }>
                Create New
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PageHome;
