import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import request from 'superagent'
import PureChart from 'react-native-pure-chart';

const ZONE = 'GB';

//TODO get actual energy targets, either researched or from other API
const UK_ARBITRARY_RENEWABLE_TARGET = 30;
const UK_ARBITRARY_NON_FOSSIL_TARGET = 34;

const KETTLE_POWER_MW = 0.5;

//https://en.wikipedia.org/wiki/Energy_in_the_United_Kingdom
const UK_MWH_PER_CAPITA = 33.82;

const API_ROOT_URL = 'https://api.electricitymap.org/v3/';

//I would usually store in environment variable but due to you running it easier if key accessible without config.
const API_KEY = 'rILfhiFrZ3emXcVMGU62';

export default class App extends React.Component {
	render() {
		console.log(this.state);
		return (
			<View style={styles.container}>
				<Text style={{fontSize: 40, textAlign: 'center'}}>Great Britain's Energy </Text>
				{this.getRenewableTargetForRendering()}
				{this.getNonFossilTargetForRendering()}

				<TouchableOpacity onPress={App.createKettleAlert}>
					<Text style={{fontSize: 22, marginTop: 40, marginBottom: 60}}>☕ Tap me to learn something ☕</Text>
				</TouchableOpacity>
				<Text style={{
					fontSize: 22,
					textAlign: 'center',
					marginBottom: 20
				}}> Energy Breakdown </Text>
				{(this.state.powerPieChart.length > 0) ?
					<PureChart data={this.state.powerPieChart} type='pie'/> : <Text>Loading Pie Chart...</Text>}
			</View>
		);
	}

	getRenewableTargetForRendering() {
		return (<View>
				<Text style={styles.heading}>Current UK renewable Energy:</Text>
				<Text style={{
					fontSize: 40,
					textAlign: 'center',
					color: this.state.renewablePercentage < UK_ARBITRARY_RENEWABLE_TARGET ? 'red' : 'green'
				}}>
					{this.state.renewablePercentage}%
				</Text>
				<Text>
					Great Britain is currently
					{this.state.renewablePercentage < UK_ARBITRARY_RENEWABLE_TARGET ? ' not ' : ' '}
					meeting its target of {UK_ARBITRARY_RENEWABLE_TARGET}%
				</Text>
			</View>
		);
	}

	getNonFossilTargetForRendering() {
		return (<View>
				<Text style={styles.heading}>Current UK non-fossil fuel Energy:</Text>
				<Text style={{
					fontSize: 40,
					textAlign: 'center',
					color: this.state.fossilFuelFreePercentage < UK_ARBITRARY_NON_FOSSIL_TARGET ? 'red' : 'green'
				}}>
					{this.state.fossilFuelFreePercentage}%</Text>
				<Text>
					Great Britain is currently
					{this.state.fossilFuelFreePercentage < UK_ARBITRARY_NON_FOSSIL_TARGET ? ' not ' : ' '}
					meeting its target of {UK_ARBITRARY_NON_FOSSIL_TARGET}%
				</Text>
			</View>
		);
	}

	static createKettleAlert() {
		Alert.alert(
			'UK Energy Usage',
			'The average UK citizen uses enough energy to boil ' + UK_MWH_PER_CAPITA / KETTLE_POWER_MW + ' kettles per hour.',
			[
				{text: 'OK'}
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
		renewablePercentage: 0.0,
		powerPieChart: []
	};

	constructor(props) {
		super(props);
	}

	//TODO carbon intensity was never actually used, if I had more time it would have been nice to visualise maybe this amount of carbon could be produced with x trucks of coal.
	retrieveCarbonIntensity() {
		request.get(API_ROOT_URL + 'carbon-intensity/latest?zone=' + ZONE)
			.set('auth-token', API_KEY)
			.then(res => {
				this.setState({carbonIntensity: res.body.carbonIntensity})
			}).catch(err => {
			console.log(JSON.stringify(err));
			return null;
		})
	};

	retrievePowerConsumptionBreakdown() {
		request.get(API_ROOT_URL + 'power-consumption-breakdown/latest?zone=' + ZONE)
			.set('auth-token', API_KEY)
			.then(res => {
				this.setState({
					powerPieChart: App.convertPowerConsumptionToPieChartData(res.body.powerConsumptionBreakdown),
					fossilFuelFreePercentage: res.body.fossilFreePercentage,
					renewablePercentage: res.body.renewablePercentage
				});
				//TODO improve error handling to give a response to user
			}).catch(null);
	};

	static convertPowerConsumptionToPieChartData(powerConsumptionBreakdown) {
		return [
			{
				label: 'Biomass',
				value: powerConsumptionBreakdown.biomass,
				color: '#6b4c38'
			},
			{
				label: 'Coal🚂 ',
				value: powerConsumptionBreakdown.coal,
				color: '#000000'
			},
			{
				label: 'Gas⛽',
				value: powerConsumptionBreakdown.gas,
				color: '#969693'
			},
			{
				label: 'Any Hydro🌊',
				value: powerConsumptionBreakdown.hydro + powerConsumptionBreakdown["hydro discharge"],
				color: '#4ab1bf'
			},
			{
				label: 'Nuclear☢️',
				value: powerConsumptionBreakdown.nuclear,
				color: '#efef34'
			},
			{
				label: 'Solar🌞',
				value: powerConsumptionBreakdown.wind,
				color: '#ffffff'
			}
		];
	}
}

//TODO improve styling, redundant element styles are used.
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		textAlign: 'center',
		justifyContent: 'center',
		fontSize: 16
	},
	heading: {
		fontSize: 22,
		textAlign: 'center'
	}
});
