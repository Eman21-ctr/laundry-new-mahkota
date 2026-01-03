import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import AppInfoForm from '../components/settings/AppInfoForm';
import PriceSettingsTable from '../components/settings/PriceSettingsTable';
import { getAppSettings, getPriceSettings } from '../services/settings';

export default function Settings() {
    const [appSettings, setAppSettings] = useState(null);
    const [priceSettings, setPriceSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appData, priceData] = await Promise.all([
                getAppSettings(),
                getPriceSettings(),
            ]);
            setAppSettings(appData);
            setPriceSettings(priceData);
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert('Gagal mengambil data pengaturan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
                <Navigation />
                <div className="flex-1 flex flex-col pb-16 md:pb-0">
                    <Header />
                    <Container className="flex-1 flex justify-center items-center py-4">
                        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </Container>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
                        <p className="text-slate-500 text-sm">Kelola informasi toko dan tarif layanan</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <AppInfoForm settings={appSettings} onUpdate={fetchData} />
                        </div>
                        <div className="lg:col-span-2">
                            <PriceSettingsTable priceSettings={priceSettings} onUpdate={fetchData} />
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}
