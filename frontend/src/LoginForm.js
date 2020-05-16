import React 		from 'react';
import InputField 	from './InputField';
import SubmitButton from './SubmitButton';
import UserStore 	from './stores/UserStore';

class LoginForm extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			email: '',
			password: '',
			buttonDisabled: false
		}
	}

	setInputValue(property, val){
		val = val.trim();
		if(val.length > 12){
			return;
		}
		this.setState({
			[property]: val
		})
	}

	resetForm(){
		this.setState({
			email: '',
			password: '',
			buttonDisabled: false
		})
	}

	async doLogin(){

		if(!this.state.email){
			return;
		}
		if (!this.state.password){
			return;
		}

		this.setState({
			buttonDisabled: true
		})


		try {
			let res = await fetch('/api/session', {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: this.state.email,
					password: this.state.password
				})
			});

			let result	= await res.json();
			if(result && result.success){
				UserStore.isLoggedIn = true;
				UserStore.email = result.email;
			}

			else if (result && result.success === false){
				this.resetForm();
				alert(result.msg);
			}
		}

		catch(e){
			console.log(e);
			this.resetForm();
		}

	}

 	render() {
    	return (
    		<div className="loginForm">

        		Log In
        		<InputField
        			type = 'text'
        			placeholder = 'email'
        			value = {this.state.email ? this.state.email : ''}
        			onChange = { (val) => this.setInputValue('email', val)  }
        		/>

        		<InputField
        			type = 'password'
        			placeholder = 'Password'
        			value = {this.state.password ? this.state.password : ''}
        			onChange = { (val) => this.setInputValue('password', val)  }
        		/>

        		<SubmitButton
                    text = 'Login'
                	disabled={this.state.buttonDisabled}
                    onClick={ () => this.doLogin() }
				/>

				<SubmitButton
								text = 'Logout'
								onClick={ () => this.doLogout() }
				/>
      		</div>

    	);
  	}

}

export default LoginForm;
