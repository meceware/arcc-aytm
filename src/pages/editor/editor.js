import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import isFunction from 'lodash/isFunction';
import { FirebaseDB } from '../../firebase';

class PageEditor extends Component {
  constructor( props ) {
    super( props );

    // Get the ID from the link
    this._id = props.match.params.id;

    // Database prefix
    this._dbPrefix = `aytm/${ this._id }`;
    // Generate a user ID temporarily
    this._userId = Math.floor( Math.random() * 9999999999 ).toString();
    // Firepad ref
    this._firepad = {};
    // Firepad database ref path
    this._firepadDbRef = FirebaseDB.ref( `${ this._dbPrefix }` );
    // Generate user display name
    this._userDisplayName = `Guest ${ Math.floor( Math.random() * 1000 ) }`;

    // Ace editor ref and instance
    this._ace = {
      ref: '',
      instance: false,
    };

    // State
    this.state = {
      language: 'c_cpp',
      color: '',
      user: {},
      userList: [],
      error: false,
      destroyed: false,
    };
  }

  componentDidMount() {
    // Set page title
    const titleTag = document.getElementsByTagName( 'title' )[ 0 ];
    titleTag.innerHTML = `ARCC - AYTM &bull; ${ this._id }`;

    window.firebase.auth().signInAnonymously().then( () => {
      this._userId = window.firebase.auth().currentUser.uid;
      // User database ref path
      this._userDbRef = FirebaseDB.ref( `${ this._dbPrefix }/presence/${ this._userId }` );

      // If connected before, remove disconnect event
      this._userDbRef.onDisconnect().remove();
      // Update user list state event
      this._userDbRef.getParent().on( 'value', snapshot => {
        const val = snapshot ? snapshot.val() : false;
        if ( val ) {
          this.setState( {
            userList: val,
          } );
        }
      } );

      // Update language state event
      this._firepadDbRef.child( 'lang' ).on( 'value', snapshot => {
        const val = snapshot ? snapshot.val() : false;
        if ( val ) {
          this.setState( {
            language: val,
          } );
        }
      } );

      // Update destroyed state event
      this._firepadDbRef.child( 'destroyed' ).on( 'value', snapshot => {
        const val = snapshot ? snapshot.val() : false;
        if ( val ) {
          this.setState( {
            destroyed: val,
          } );
        }
      } );

      // Create the editor
      if ( this._ace.ref ) {
        const editor = window.ace.edit( this._ace.ref );
        editor.session.setMode( `ace/mode/${ this.state.language }` );
        editor.session.setTabSize( 2 );
        editor.session.setUseWrapMode( true );
        editor.renderer.setScrollMargin( 2, 2 );
        editor.renderer.setPadding( 2 );
        editor.$blockScrolling = Infinity;
        editor.setOptions( {
          enableBasicAutocompletion: true,
          enableEmmet: true,
          enableSnippets: true,
          enableLiveAutocompletion: false,
          showGutter: true,
          highlightGutterLine: true,
          showPrintMargin: false,
          vScrollBarAlwaysVisible: false,
          wrap: false,
          theme: 'ace/theme/textmate',
          fontSize: '15px',
          useSoftTabs: true,
          tabSize: 4,
        } );

        this._ace.instance = editor;
        // Connect firepad to the editor
        this._firepad = window.Firepad.fromACE( this._firepadDbRef, editor, {
          userId: this._userId,
          defaultText: [ '#include <iostream>',
            '',
            'int main(void) {',
            '  std::cout << "Hello World!" << std::endl;',
            '  return 0;',
            '}',
          ].join( '\n' ),
        } );

        // Firepad ready event
        this._firepad.on( 'ready', () => {
          this.setState( {
            // Set user
            user: {
              id: this._userId,
              color: this._firepad.firebaseAdapter_.color_,
              displayName: this._userDisplayName,
            },
            color: this._firepad.firebaseAdapter_.color_,
          } );
          editor.resize();
        } );
      } else {
        this.setState( {
          error: 'Cannot initialize ACE',
        } );
      }
    } );
  }

  shouldComponentUpdate( nextProps, nextState ) {
    // Check if the user state changes
    if ( JSON.stringify( this.state.user ) !== JSON.stringify( nextState.user ) ) {
      this._userDbRef.set( {
        displayName: nextState.user.displayName,
        color: nextState.user.color,
      } );
    }

    // Check if language state changes
    if ( this.state.language !== nextState.language ) {
      this._ace.instance.session.setMode( `ace/mode/${ nextState.language }` );
      this._firepadDbRef.child( 'lang' ).set( nextState.language );
    }

    // Check if the session is destroyed
    if ( this.state.destroyed !== nextState.destroyed ) {
      this._firepadDbRef.child( 'destroyed' ).set( nextState.destroyed );
    }

    return true;
  }

  componentWillUnmount() {
    // Destroy Ace editor
    if ( this._ace.instance && isFunction( this._ace.instance.destroy ) ) {
      this._ace.instance.destroy();
    }

    // Destroy firepad
    if ( this._firepad && isFunction( this._firepad.dispose ) ) {
      this._firepad.dispose();
    }

    // Remove events
    this._firepadDbRef.child( 'lang' ).off();
    this._firepadDbRef.child( 'destroyed' ).off();

    this._userDbRef.getParent().off( 'value' );
    this._userDbRef.remove();

    window.firebase.auth().currentUser?.delete();
  }

  render() {
    // Redirect to the homepage if there is an error
    if ( this.state.error ) {
      console.error( this.state.error );
      return (
        <Redirect to = '/' />
      );
    }

    // Redirect to homepage if session is destroyed
    if ( this.state.destroyed ) {
      return (
        <Redirect to = '/' />
      );
    }

    // Eye icon
    const eye = (
      <svg
        className = 'fill-current w-5 h-5 ml-2'
        viewBox = '0 0 24 24'
        preserveAspectRatio = 'xMidYMid meet'
      >
        <g id = 'remove-red-eye'>
          <path d = 'M0 0h24v24H0z' fill = 'none' />
          <path d = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
        </g>
      </svg>
    );

    // Power Off icon
    const powerOff = (
      <svg
        className = 'fill-current w-4 h-4 ml-2'
        viewBox = '0 0 24.303 24.303'
        preserveAspectRatio = 'xMidYMid meet'
      >
        <g>
          <path d = 'M10.269,11.298V1.883C10.269,0.844,11.113,0,12.152,0s1.883,0.844,1.883,1.883v9.415 c0,1.039-0.844,1.883-1.883,1.883S10.269,12.337,10.269,11.298z M19.616,2.761c-0.61-0.483-1.5-0.377-1.983,0.234 c-0.483,0.612-0.378,1.5,0.234,1.984c2.24,1.767,3.524,4.413,3.524,7.261c0,5.094-4.145,9.239-9.238,9.239 c-5.094,0-9.239-4.145-9.239-9.239c0-2.847,1.283-5.492,3.521-7.258c0.612-0.483,0.717-1.371,0.234-1.984 c-0.483-0.612-1.37-0.716-1.984-0.234C1.764,5.069,0.089,8.523,0.089,12.24c0,6.652,5.412,12.063,12.063,12.063 s12.063-5.412,12.063-12.063C24.215,8.521,22.538,5.067,19.616,2.761z' />
        </g>
      </svg>
    );

    return (
      <div className = 'flex flex-col min-h-screen relative'>
        <header className = 'flex flex-initial flex-col border border-r-0 border-t-0 border-l-0 border-gray-400 border-solid relative px-4 bg-gray-800' style = { { borderColor: this.state.color } }>
          <div className = 'relative select-none flex items-stretch w-full py-1'>
            <div className = 'flex flex-1 justify-start items-center leading-loose text-xl text-gray-100'>
              <Link to = '/'>
                <h1>ARCC - AYTM</h1>
              </Link>
            </div>
            <div className = 'flex flex-1 justify-center items-center '>
              <div className = 'dropdown inline-block relative overflow-hidden w-20 sm:w-40 h-8 rounded-md bg-gray-700 border border-solid border-black'>
                <select
                  value = { this.state.language }
                  className = 'dropdown-select relative m-0 py-1 px-2 h-full text-xs text-gray-100 bg-gray-700 border-none appearance-none outline-none'
                  onChange = { event => {
                    this.setState( { language: event.target.value } );
                  } }
                >
                  <option value = 'c_cpp'>C/C++</option>
                  <option value = 'java'>Java</option>
                  <option value = 'python'>Python</option>
                </select>
              </div>
            </div>
            <div className = 'flex flex-1 justify-end items-center leading-loose text-base text-gray-100'>
              { Object.keys( this.state.userList ).length }{ eye }<Link to = '/' className = 'text-red-500 ml-4' onClick = { () => {
                this._firepadDbRef.child( 'destroyed' ).set( true );
              } }>{ powerOff }</Link>
            </div>
          </div>
        </header>
        <main className = 'relative flex flex-auto content-center flex-wrap flex-col'>
          <div className = 'relative flex flex-col flex-1 w-full'>
            <div ref = { c => ( this._ace.ref = c ) } className = 'relative flex flex-1 w-full h-full' />
          </div>
        </main>
      </div>
    );
  }
}

export default PageEditor;
