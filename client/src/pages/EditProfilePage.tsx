import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Row } from 'antd';
import { useForm } from 'react-hook-form';
import { profileInputFields } from '../constant/profile';
import { useGetSelfProfileQuery, useUpdateProfileMutation } from '../redux/features/authApi';
import Loader from '../components/Loader';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../components/CustomInput';

const EditProfilePage = () => {
  const { data, isLoading } = useGetSelfProfileQuery(undefined);
  const [updateProfile] = useUpdateProfileMutation();
  const navigate = useNavigate();

  if (isLoading) return <Loader />;

  const onSubmit = async (data: any) => {
    const toastId = toast.loading('Mise à jour du profil...');
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.__v;

    for (const key in data) {
      if (!data[key]) delete data[key];
    }

    try {
      const res = await updateProfile(data).unwrap();
      if (res.success) {
        toast.success('Profil mis à jour avec succès !', { id: toastId });
        navigate('/profile');
      }
    } catch (error) {
      toast.error('Échec de la mise à jour.', { id: toastId });
    }
  };

  return (
    <Row justify="center" align="middle" style={{ height: '100vh' }}>
      <Col xs={{ span: 24 }} lg={{ span: 12 }}>
        <Flex justify="end" style={{ marginBottom: '1rem' }}>
          <Button type="default" onClick={() => navigate('/profile')}>
            <ArrowLeftOutlined /> Retour
          </Button>
        </Flex>
        <EditProfileForm data={data?.data} onSubmit={onSubmit} />
      </Col>
    </Row>
  );
};

export default EditProfilePage;

const EditProfileForm = ({ data, onSubmit }: { data: any, onSubmit: (data: any) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: data });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '500px', margin: '0 auto' }}>
      {profileInputFields.map((input) => (
        <CustomInput
          key={input.id}
          name={input.name}
          errors={errors}
          label={input.label}
          register={register}
          required={false}
        />
      ))}
      <Flex justify="center" style={{ marginTop: '1rem' }}>
        <Button
          htmlType="submit"
          type="primary"
          style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          Mettre à jour
        </Button>
      </Flex>
    </form>
  );
};
