import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import request from 'superagent'
import PureChart from 'react-native-pure-chart';


const ZONE = 'GB';
const UK_ARBITRARY_RENEWABLE_TARGET = 30;
const UK_ARBITRARY_NON_FOSSIL_TARGET = 32;

const KETTLE_POWER_MW = 0.5;

//https://en.wikipedia.org/wiki/Energy_in_the_United_Kingdom
const UK_MWH_PER_CAPITA = 33.82;

const API_ROOT_URL = 'https://api.electricitymap.org/v3/';

//Would usually store in environment variable but due to you running it easier if key accessible without config.
const API_KEY = 'rILfhiFrZ3emXcVMGU62';

export default class App extends React.Component {
	render() {
		console.log(this.state);
		return (
			<View style={styles.container}>
				<Text style={{fontSize: 22}}>Current UK renewable Energy:</Text>
				<Text style={{
					fontSize: 40,
					color: this.state.renewablePercentage < UK_ARBITRARY_RENEWABLE_TARGET ? 'red' : 'green'
				}}>
					{this.state.renewablePercentage}%
				</Text>
				<Text> Great Britain is
					currently {this.state.renewablePercentage < UK_ARBITRARY_RENEWABLE_TARGET ? 'not ' : ''}
					meeting its target of {UK_ARBITRARY_RENEWABLE_TARGET}%</Text>

				<Text style={{fontSize: 22}}>Current UK non-fossil fuel Energy:</Text>
				<Text style={{
					fontSize: 40,
					color: this.state.fossilFuelFreePercentage < UK_ARBITRARY_NON_FOSSIL_TARGET ? 'red' : 'green'
				}}>
					{this.state.fossilFuelFreePercentage}%</Text>
				<TouchableOpacity onPress={this.createKettleAlert}>
					<Text style={{fontSize: 22, marginTop: 40, marginBottom: 60}}>☕ Click me to learn something ☕</Text>
				</TouchableOpacity>
				<PureChart data={[
					{
						value: 50,
						label: 'Marketing',
						color: 'red',
					}, {
						value: 40,
						label: 'Sales',
						color: 'blue'
					},
					{
						value: 25,
						label: 'Support',
						color: 'green',
					}]} type='pie'/>

			</View>
		);
	}

	createKettleAlert = () => {
		Alert.alert(
			'UK Energy Usage',
			'The average UK citizen uses enough energy to boil ' + UK_MWH_PER_CAPITA / KETTLE_POWER_MW + ' kettles per hour.',
			[
				{text: 'OK', onPress: () => console.log('OK Pressed')}
			],
			{cancelable: true}
		)
	};

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

	retrieveCarbonIntensity = () => {
		request.get(API_ROOT_URL + 'carbon-intensity/latest?zone=' + ZONE)
			.set('auth-token', API_KEY)
			.then(res => {
				this.setState({carbonIntensity: res.body.carbonIntensity})
			}).catch(err => {
			console.log(JSON.stringify(err));
			return null;
		})
	};

	retrievePowerConsumptionBreakdown = () => {
		request.get(API_ROOT_URL + 'power-consumption-breakdown/latest?zone=' + ZONE)
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
		marginTop: 40,
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		textAlign: 'center',
		justifyContent: 'center',
		fontSize: 16
	}
});
