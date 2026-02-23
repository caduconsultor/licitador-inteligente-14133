// Environment configuration and validation

interface EnvConfig {
    NODE_ENV: 'development' | 'production';
    PORT: number;
    DB_URI: string;
}

function validateEnv(config: EnvConfig) {
    if (!config.NODE_ENV) {
        throw new Error('NODE_ENV is not set');
    }
    if (!config.PORT) {
        throw new Error('PORT is not set');
    }
    if (!config.DB_URI) {
        throw new Error('DB_URI is not set');
    }
}

const envConfig: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DB_URI: process.env.DB_URI || '',
};

validateEnv(envConfig);

export default envConfig;