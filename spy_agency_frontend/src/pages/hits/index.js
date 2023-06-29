"use client"
import 'tailwindcss/tailwind.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Navbar from "@component/Navbar"
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { CreateHitModal } from '@component/CreateHitModal';
import EmptyState from '@component/EmptyState';


export default function Hits() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authToken, setAuthToken] = useState('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')

    const [hits, setHits] = useState([])

    const router = useRouter();

    const handleMe = async (authToken) => {
        const url = 'http://0.0.0.0:8000/api/hitmen/me/';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + authToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setName(data.name);
                setEmail(data.email);
                setType(data._type);
                setDescription(data.description);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error)
            setError('An error occurred. Please try again.');
        }
    }

    const handleHits = async (authToken) => {
        const url = 'http://0.0.0.0:8000/api/hits/';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + authToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHits(data)
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error)
            setError('Hits: An error occurred. Please try again.');
        }
    }

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        handleHits(authToken)
    };
    useEffect(() => {
        const localAuthToken = localStorage.getItem("authToken")
        if (localAuthToken) {
            setAuthToken(localAuthToken)
        } else {
            router.push("/notfound")
        }

        if (authToken) {
            handleMe(authToken)
            handleHits(authToken)
        }
    }, [authToken])

    return (
        <div>
            <Navbar />
            <div className="px-4 sm:px-6 md:px-10 xl:px-96 py-10">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Hello, {name}</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Your email: {email}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                            You are a {type}.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none" hidden={type == "Big Boss" || type == "Manager" ? false : true}>
                        <button
                            onClick={openModal}
                            type="button"
                            className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            New Hit
                        </button>
                    </div>

                </div>
            </div>

            {
                hits.length > 0 ? (
                    <div className="px-4 sm:px-6 md:px-10 xl:px-96 py-10">
                        <div className="mt-8 overflow-y-scroll overflow-x-hidden max-h-[35rem]">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="min-w-full divide-y divide-gray-300 overflow-y-scroll">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Assignee
                                                </th>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Hit
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Created by
                                                </th>
                                                <th scope="col" className="relative text-left py-3.5 pr-4 sm:pr-0">
                                                    <span className="sr-only">Edit</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {hits.map((person) => (
                                                <tr key={person.id}>
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                        <div className="flex items-center">
                                                            <div className="">
                                                                <div className="font-medium text-green-700">{person.assigned_hitman}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                        <div className="flex items-center">
                                                            <div className="">
                                                                <div className="font-medium text-red-700">{person.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        <div className="text-gray-900">{person.description}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${person.state == "Unassigned" ? "text-red-700 bg-red-50" : "text-green-700 bg-green-50"} ring-1 ring-inset ring-green-600/20`}>
                                                            {person.state}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{person.created_by}</td>
                                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
                                                        <button
                                                            onClick={openModal}
                                                            type="button"
                                                            className="relative inline-flex items-center justify-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                                        >
                                                            <PencilSquareIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (<EmptyState label="hit" />)
            }

            <CreateHitModal hits={hits} handleHits={handleHits} isOpen={isModalOpen} closeModal={closeModal} />
        </div>
    )
}
