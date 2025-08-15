import React from 'react';

interface LoaderProps {
    text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
    return (
        <div className="flex justify-center items-center my-6">
            <div className="loader"></div>
            <p className="ml-4 text-gray-600">{text}</p>
        </div>
    );
};

export default Loader;