import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addStudent, getStudent, updateStudent } from 'api/students.api'
import { useEffect, useMemo, useState } from 'react'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { Student } from 'types/student.type'
import { isAxiosError } from 'utils/utils'

type FormStateType = Omit<Student, 'id'> | Student

const initialFormState: FormStateType = {
  first_name: '',
  last_name: '',
  email: '',
  gender: 'other',
  btc_address: '',
  country: '',
  avatar: ''
}

const gender = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}

type ErrorForm =
  | {
      [key in keyof FormStateType]: string
    }
  | null

export default function AddStudent() {
  const [formState, setFormState] = useState<FormStateType>(initialFormState)
  const queryClient = useQueryClient()
  const addMatch = useMatch('/students/add')
  const isAddMode = Boolean(addMatch)
  const { id } = useParams()
  const navigate = useNavigate()

  const addStudentMutate = useMutation({
    mutationFn: (body: FormStateType) => addStudent(body)
  })

 const studentQuery = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id as string),
    staleTime: 1000 * 10,
    enabled: id !== undefined,
  })

  useEffect(() => {
   if(studentQuery.data) {
      setFormState(studentQuery.data.data)
    } 
  }, [studentQuery.data])

  const updateStudentMutate = useMutation({
    mutationFn: (_) => updateStudent(id as string, formState as Student),
    onSuccess: (data) => {
      queryClient.getQueryData(['student', id], data.data)
    }
  })

  const errorForm: ErrorForm = useMemo(() => {
    const error = isAddMode ? addStudentMutate.error : updateStudentMutate.error
    if (isAxiosError<{ error: ErrorForm }>(error) && error.response?.status === 422) {
      return error.response?.data.error
    }
    return null
  }, [addStudentMutate.error, isAddMode, updateStudentMutate.error])

  const handleChangeValueForm = (name: keyof FormStateType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: event.target.value }))
    if (addStudentMutate.data || addStudentMutate.error) {
      addStudentMutate.reset()
    }
    if (updateStudentMutate.data || updateStudentMutate.error) {
      updateStudentMutate.reset()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isAddMode) {
      // Cach 1: mutate is async but it doest not return promise, so we must use onSucces to reset form
      addStudentMutate.mutate(formState, {
        onSuccess: () => {
          setFormState(initialFormState)
        }
      })
      // Cach 2: mutateAsync is async and return promise, so we must use try catch
      // try {
      //   await mutateAsync(formState)
      //   setFormState(initialFormState)
      // } catch (error) {
      //   console.log('error', error)
      // }
    } else {
      updateStudentMutate.mutate(undefined, {
        onSuccess: () => {
          setFormState(initialFormState)
          navigate('/students')
        }
      })
    }
  }

  return (
    <div>
      <h1 className='text-lg'>{isAddMode ? 'Add' : 'Edit'}Student</h1>
      <form className='mt-6' onSubmit={handleSubmit}>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='floating_email'
            id='floating_email'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0'
            placeholder=' '
            value={formState.email}
            onChange={handleChangeValueForm('email')}
            required
          />
          <label
            htmlFor='floating_email'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Email address
          </label>
          {errorForm && <p className='text-sm text-red-500'>Lỗi! {errorForm.email}</p>}
        </div>

        <div className='group relative z-0 mb-6 w-full'>
          <div>
            <div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-1'
                  type='radio'
                  name='gender'
                  value={gender.male}
                  checked={formState.gender === gender.male}
                  onChange={handleChangeValueForm('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500'
                />
                <label htmlFor='gender-1' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  {gender.male}
                </label>
              </div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-2'
                  type='radio'
                  name='gender'
                  value={gender.female}
                  checked={formState.gender === gender.female}
                  onChange={handleChangeValueForm('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500'
                />
                <label htmlFor='gender-2' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  {gender.female}
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  id='gender-3'
                  type='radio'
                  name='gender'
                  value={gender.other}
                  checked={formState.gender === gender.other}
                  onChange={handleChangeValueForm('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500'
                />
                <label htmlFor='gender-3' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  {gender.other}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='country'
            id='country'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0'
            placeholder=' '
            value={formState.country}
            onChange={handleChangeValueForm('country')}
            required
          />
          <label
            htmlFor='country'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600'
          >
            Country
          </label>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='first_name'
              id='first_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 '
              placeholder=' '
              value={formState.first_name}
              onChange={handleChangeValueForm('first_name')}
              required
            />
            <label
              htmlFor='first_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 '
            >
              First Name
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='last_name'
              id='last_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 '
              placeholder=' '
              required
              value={formState.last_name}
              onChange={handleChangeValueForm('last_name')}
            />
            <label
              htmlFor='last_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 '
            >
              Last Name
            </label>
          </div>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='avatar'
              id='avatar'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 '
              placeholder=' '
              required
              value={formState.avatar}
              onChange={handleChangeValueForm('avatar')}
            />
            <label
              htmlFor='avatar'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600'
            >
              Avatar Base64
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='btc_address'
              id='btc_address'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0'
              placeholder=' '
              required
              value={formState.btc_address}
              onChange={handleChangeValueForm('btc_address')}
            />
            <label
              htmlFor='btc_address'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 '
            >
              BTC Address
            </label>
          </div>
        </div>

        <button
          type='submit'
          className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto'
        >
          Submit
        </button>
      </form>
    </div>
  )
}
