import {
    Card,
    CardContent,
    FormControl,
    MenuItem,
    Select,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import 'leaflet/dist/leaflet.css';

function App() {
    const [countries, setCountries] = useState(['USA', 'UK', 'INDIA']);
    const [country, setCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({
        lat: 23.9037,
        lng: 121.0794,
    });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState('cases');

    // STATE = How to write a variable in REACT <<<

    // USEEFFECT = Runs a piece of code in
    // based on a given condition

    useEffect(() => {
        fetch('https://disease.sh/v3/covid-19/all')
            .then((response) => response.json())
            .then((data) => {
                setCountryInfo(data);
            });
    }, []);

    useEffect(() => {
        // The code inside here will run once in
        // When the component loads and not again
        // return () => {};
        // async -> send a request, wait for it, do something with input
        const getCountriesData = async () => {
            // fetch are built in javascript do not need extra library
            await fetch('https://disease.sh/v3/covid-19/countries')
                .then((response) => response.json())
                .then((data) => {
                    const countries = data.map((country) => ({
                        name: country.country, // ex: United States, United Kingdom
                        value: country.countryInfo.iso2, // ex: UK, USA, FR
                    }));
                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);
                });
        };
        getCountriesData();
    }, []);

    const onCountryChange = async (event) => {
        const countryCode = event.target.value;
        setCountry(countryCode);

        const url =
            countryCode === 'worldwide'
                ? 'https://disease.sh/v3/covid-19/all'
                : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setCountry(countryCode);
                setCountryInfo(data);
                setMapCenter({
                    lat: data.countryInfo.lat,
                    lng: data.countryInfo.long,
                });
                setMapZoom(4);
            });
    };

    console.log('country info >>> :', countryInfo);

    return (
        <div className="app">
            <div className="app__left">
                <div className="app__header">
                    <h1>COVID-19 TRACKER Vito</h1>
                    <FormControl className="app__dropdown">
                        <Select
                            variant="outlined"
                            value={country}
                            onChange={onCountryChange}
                        >
                            <MenuItem value="worldwide">Worldwide</MenuItem>
                            {countries.map((country, index) => (
                                <MenuItem
                                    key={`country_${index}`}
                                    value={country.value}
                                >
                                    {country.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="app__stats">
                    <InfoBox
                        isRed
                        active={casesType === 'cases'}
                        onClick={(e) => setCasesType('cases')}
                        title="Coronavirus Cases"
                        cases={prettyPrintStat(countryInfo.todayCases)}
                        total={prettyPrintStat(countryInfo.cases)}
                    />
                    <InfoBox
                        active={casesType === 'recovered'}
                        onClick={(e) => setCasesType('recovered')}
                        title="Recovered"
                        cases={prettyPrintStat(countryInfo.todayRecovered)}
                        total={prettyPrintStat(countryInfo.recovered)}
                    />
                    <InfoBox
                        isRed
                        active={casesType === 'deaths'}
                        onClick={(e) => setCasesType('deaths')}
                        title="Deaths"
                        cases={prettyPrintStat(countryInfo.todayDeaths)}
                        total={prettyPrintStat(countryInfo.deaths)}
                    />
                </div>
                <Map
                    casesType={casesType}
                    countries={mapCountries}
                    center={mapCenter}
                    zoom={mapZoom}
                />
            </div>
            <Card className="app__right">
                <CardContent>
                    {/* Table */}
                    <h3>Live Cases by Country</h3>
                    <Table countries={tableData}></Table>
                    {/* Graph */}
                    <h3 className="app__graphTitle">
                        Worldwide new {casesType}
                    </h3>
                    <LineGraph className="app__graph" casesType={casesType} />
                </CardContent>
            </Card>
        </div>
    );
}

export default App;
