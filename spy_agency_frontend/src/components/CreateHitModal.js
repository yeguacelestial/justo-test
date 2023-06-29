"use client"
import 'tailwindcss/tailwind.css';

import { Fragment, useEffect, useRef, useState } from 'react'
import { Menu, Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import DropdownSelect from './DropdownSelect';


export const CreateHitModal = ({ isOpen, closeModal }) => {
    const cancelButtonRef = useRef(null);

    const [authToken, setAuthToken] = useState('')
    const [hitmen, setHitmen] = useState([])

    const [assignee, setAsignee] = useState()
    const [targetName, setTargetName] = useState("")
    const [targetDescription, setTargetDescription] = useState("")

    const [error, setError] = useState()

    const handleHitmen = async (authToken) => {
        const url = 'http://0.0.0.0:8000/api/hitmen/active/';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + authToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHitmen(data)
            } else {
                const errorData = await response.json();
                const errorMessage = errorData?.non_field_errors[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            console.error(error)
            setError('[Hitmen] An error occurred. Please try again.');
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const url = 'http://0.0.0.0:8000/api/hits/';
        const body = {
            "assigned_hitman": assignee ? assignee.id : "",
            "name": targetName,
            "description": targetDescription,
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                // Registration successful, redirect to another page
                router.push('/');

            } else {
                const errorData = await response.json();
                const errorMessage = Object.values(errorData)[0] || 'Unknown error occurred';
                setError(errorMessage);
            }
        } catch (error) {
            setError('[Form] An error occurred. Please try again.: ' + error);
        }
    };

    useEffect(() => {
        const localAuthToken = localStorage.getItem("authToken")
        if (localAuthToken) {
            setAuthToken(localAuthToken)
        }

        handleHitmen(authToken)
    }, [authToken, hitmen])

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                                    <h2 className="my-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                                        Create a new hit.
                                    </h2>
                                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">

                                        <form className="space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
                                            <div className="mt-2">
                                                <DropdownSelect label="Assignee" options={hitmen} selected={assignee} setSelected={setAsignee} />
                                            </div>

                                            <div>
                                                <label htmlFor="targetName" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Target name
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="target-name"
                                                        name="target-name"
                                                        type="text"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        placeholder='Her or his name.'
                                                        value={targetName}
                                                        onChange={(e) => setTargetName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Description
                                                </label>
                                                <div className="mt-2 mb-20">
                                                    <input
                                                        id="description"
                                                        name="description"
                                                        type="text"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        placeholder='A brief description of the target.'
                                                        value={targetDescription}
                                                        onChange={(e) => setTargetDescription(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            {error && (
                                                <div className="text-red-500 mt-2">{error}</div>
                                            )}
                                            <div>
                                                <button
                                                    type="submit"
                                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Create hit
                                                </button>
                                            </div>
                                        </form>

                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

        </Transition.Root>

    );
};