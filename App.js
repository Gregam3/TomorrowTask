import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import request from 'superagent'

// const ZONE = 'GB';

const API_ROOT_URL = 'https://api.electricitymap.org/v3/';

//Would usually store in environment variable but due to you running it easier if key accessible without config.
const API_KEY = 'rILfhiFrZ3emXcVMGU62';

export default class App extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Text>Current UK carbon intensity: {this.state.carbonIntensity}</Text>
				<Text>Current renewable percentage: {this.state.renewablePercentage}%</Text>
				<Text>Fossil Fuel free percentage: {this.state.fossilFuelFreePercentage}%</Text>
			</View>
		);
	}

	componentDidMount() {
		this.retrieveCarbonIntensity();
		this.retrievePowerConsumptionBreakdown();
	}

	state = {
		carbonIntensity: 0,
		fossilFuelFreePercentage: 0.0,
		renewablePercentage: 0.0
	};

	constructor(props) {
		super(props);
	}

	retrieveCarbonIntensity = async () => {
		request.get(API_ROOT_URL + 'carbon-intensity/latest')
			.set('auth-token', API_KEY)
			.then(res => {
				this.setState({carbonIntensity: res.body.carbonIntensity})
			}).catch(err => {
			console.log(JSON.stringify(err));
			return null;
		})
	};

	retrievePowerConsumptionBreakdown = async () => {
		request.get(API_ROOT_URL + 'power-consumption-breakdown/latest')
			.set('auth-token', API_KEY)
			.then(res => {
				this.setState({fossilFuelFreePercentage: res.body.fossilFreePercentage});
				this.setState({renewablePercentage: res.body.renewablePercentage});
			}).catch(err => {
				console.log(JSON.stringify(err));
				return null;
			})
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
