"use client"
import 'tailwindcss/tailwind.css';

import { Fragment, useEffect, useRef, useState } from 'react'
import { Menu, Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation';

import AssigneeDropdownSelect from '@component/AssigneeDropdownSelect';
import StatusDropdownSelect from '@component/StatusDropdownSelect';


export const EditHitModal = ({ hitId, userType, isEditHitModalOpen, closeEditHitModal }) => {
    /* 
        HITMEN: They can only change the Hit status to Completed or Failed.
        MANAGERS: They can change the assignee for Assigned hits. For closed (Failed or Succeeded) everything is read only.
        BIG BOSS: Same as the manager.

        A hit cannot be assigned to an inactive user.
        If the assigned hitman is inactive, it should be allowed to stay as is but update other items.
    */
    const cancelButtonRef = useRef(null);

    const [authToken, setAuthToken] = useState('')
    const [hitmen, setHitmen] = useState([])

    const [assignee, setAsignee] = useState()
    const [targetName, setTargetName] = useState("")
    const [targetDescription, setTargetDescription] = useState("")

    const [error, setError] = useState()

    const [statusOptions, setStatusOptions] = useState([{ id: 1, type: "Completed", description: "Well done!" }, { id: 2, type: "Failed", description: "Good luck next time." }])
    const [status, setStatus] = useState("")

    const router = useRouter()

    const removeEmptyElements = (obj) => {
        Object.keys(obj).forEach((key) => {
            if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
                delete obj[key];
            }
        });

        return obj;
    }

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
            // setError('[Hitmen] An error occurred. Please try again.');
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(String(status))
        const url = `http://0.0.0.0:8000/api/hits/${hitId}/`;
        const body = removeEmptyElements({
            "assigned_hitman": assignee ? assignee.email : "",
            "name": targetName,
            "description": targetDescription,
            "state": String(status.type).charAt(0),
        })

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + authToken,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();
                closeEditHitModal()
                setError()
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
    }, [authToken])

    return (
        <Transition.Root show={isEditHitModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeEditHitModal}>
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
                                        Edit a hit.
                                    </h2>
                                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">

                                        <form className="space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
                                            {userType == "Big Boss" || userType == "Manager" ? (
                                                <>
                                                    <div className="mt-2">
                                                        <AssigneeDropdownSelect label="Assignee" options={hitmen} selected={assignee} setSelected={setAsignee} />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="targetName" className="block text-sm font-medium leading-6 text-gray-900">
                                                            Hit name
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
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                                            Description
                                                        </label>
                                                        <div className="mt-2">
                                                            <input
                                                                id="description"
                                                                name="description"
                                                                type="text"
                                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                placeholder='A brief description of the target.'
                                                                value={targetDescription}
                                                                onChange={(e) => setTargetDescription(e.target.value)}
                                                            />
                                                        </div>
                                                    </div></>
                                            ) : (<></>)}

                                            <StatusDropdownSelect label="Status" options={statusOptions} selected={status} setSelected={setStatus} />
                                            {error && (
                                                <div className="text-red-500 mt-2">{error}</div>
                                            )}
                                            <div>
                                                <button
                                                    type="submit"
                                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                    onSubmit={closeEditHitModal}
                                                >
                                                    Update hit
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