"use client"
import 'tailwindcss/tailwind.css';

import Navbar from "@component/Navbar"
import { PlusIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react';
import { HitmanModal } from '@component/HitmanModal';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InChargeOfModal from '@component/InChargeOfModal';
import EmptyState from '@component/EmptyState';


const people = [


    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        department: 'Optimization',
        email: 'lindsay.walton@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        department: 'Optimization',
        email: 'lindsay.walton@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        department: 'Optimization',
        email: 'lindsay.walton@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        department: 'Optimization',
        email: 'lindsay.walton@example.com',
        role: 'Member',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    // More people...
]

export default function Hitmen() {
    const [authToken, setAuthToken] = useState('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const [inChargeOfHitmanId, setInChargeOfHitmanId] = useState("")

    const [hitmen, setHitmen] = useState([])

    const [isInChargeOfModalOpen, setIsInChargeOfModalOpen] = useState(false);

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

    const handleHitmen = async (authToken) => {
        const url = 'http://0.0.0.0:8000/api/hitmen/';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + authToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setHitmen(data)
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error)
            setError('Hitmen: An error occurred. Please try again.');
        }
    }

    const openInChargeOfModal = () => {
        setIsInChargeOfModalOpen(true);
    };

    const closeInChargeOfModal = () => {
        setIsInChargeOfModalOpen(false);
        handleHitmen(authToken)
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
            handleHitmen(authToken)
        }
    }, [authToken])

    useEffect(() => {
        if (type == "Hitman") {
            router.push("/notfound")
        }
    }, [type])

    return (
        <div>
            <Head>
                <title>Hitmen | Spy Agency</title>
            </Head>

            <Navbar userType={type} />
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

                </div>
            </div>

            {
                hitmen.length > 0 ? (
                    <div className="px-4 sm:px-6 md:px-10 xl:px-96 py-10">
                        <div className="mt-8 overflow-x-auto lg:overflow-x-hidden max-h-[35rem]">
                            <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className='sticky top-0 bg-white z-10'>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Hitman name
                                                </th>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                {type == "Big Boss" ?
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        In charge of
                                                    </th>
                                                    : <></>
                                                }

                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {hitmen.map((hitman) => (
                                                <tr key={hitman.id}>
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                        <div className="flex items-center">
                                                            <div className="">
                                                                <div className="font-medium text-green-700">{hitman.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap py-5 text-sm text-gray-500">
                                                        <div className="text-gray-900">{hitman.email}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        <div className="text-gray-900">{hitman.description}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${hitman.is_active == true ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"} ring-1 ring-inset ring-green-600/20`}>
                                                            {hitman.is_active == true ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    {type == "Big Boss" ?
                                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-3 inset-x-5 text-sm font-medium sm:pr-0">
                                                            <button
                                                                onClick={() => openInChargeOfModal(hitman.id)}
                                                                type="button"
                                                                className="relative inline-flex items-center justify-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                                            >
                                                                <UserGroupIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                                            </button>
                                                        </td>
                                                        : <></>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (<EmptyState label="hitmen" />)
            }
            <InChargeOfModal requestUserType={type} hitmanId={inChargeOfHitmanId} isOpen={isInChargeOfModalOpen} closeModal={closeInChargeOfModal} />
        </div>
    )
}
