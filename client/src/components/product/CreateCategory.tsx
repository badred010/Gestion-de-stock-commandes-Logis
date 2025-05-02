import { Button, Flex } from 'antd';
import { useState } from 'react';
import { useCreateCategoryMutation } from '../../redux/features/management/categoryApi';
import toastMessage from '../../lib/toastMessage';

const CreateCategory = () => {
  const [createCategory] = useCreateCategoryMutation();
  const [category, setCategory] = useState('');

  const handleClick = async () => {
    try {
      const res = await createCategory({ name: category }).unwrap();
      if (res.statusCode === 201) {
        toastMessage({ icon: 'success', text: res.message });
        setCategory('');
      }
    } catch (error: any) {
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  return (
    <Flex
      vertical
      style={{
        padding: '1rem 2rem',
        border: '1px solid #b6cbd7',
        borderRadius: '.6rem',
        marginBottom: '1rem',
      }}
    >
      <h3
        style={{
          textAlign: 'center',
          marginBottom: '.6rem',
          fontWeight: '900',
          textTransform: 'uppercase',
        }}
      >
        Créer catégorie
      </h3>
      <input
        type='text'
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className='input-field'
        placeholder='Categorie'
      />
      <Button
        htmlType='button'
        onClick={handleClick}
        type='primary'
        style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
      >
        Créer
      </Button>
    </Flex>
  );
};

export default CreateCategory;
