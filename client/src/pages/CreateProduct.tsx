import { Button, Col, Flex, Row } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import ChampPersonnalise from '../components/CustomInput';
import messageToast from '../lib/toastMessage';
import { useGetAllBrandsQuery } from '../redux/features/management/brandApi';
import { useGetAllCategoriesQuery } from '../redux/features/management/categoryApi';
import { useCreateNewProductMutation } from '../redux/features/management/productApi';
import { useGetAllSellerQuery } from '../redux/features/management/sellerApi';
import { ICategory } from '../types/product.types';
import CreerVendeur from '../components/product/CreateSeller';
import CreerCategorie from '../components/product/CreateCategory';
import CreerMarque from '../components/product/CreateBrand';

const CreateProduct = () => {
  const [creerNouveauProduit] = useCreateNewProductMutation();
  const { data: categories } = useGetAllCategoriesQuery(undefined);
  const { data: vendeurs } = useGetAllSellerQuery(undefined);
  const { data: marques } = useGetAllBrandsQuery(undefined);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (donnees: FieldValues) => {
    const payload = { ...donnees };
    payload.price = Number(donnees.price);
    payload.stock = Number(donnees.stock);

    if (payload.size === '') {
      delete payload.size;
    }

    try {
      const reponse = await creerNouveauProduit(payload).unwrap();
      if (reponse.statusCode === 201) {
        messageToast({ icon: 'success', text: reponse.message });
        reset();
      }
    } catch (erreur: any) {
      console.log(erreur);
      messageToast({ icon: 'error', text: erreur.data.message });
    }
  };

  return (
    <>
      <Row
        gutter={30}
        style={{
          height: 'calc(100vh - 6rem)',
          overflow: 'auto',
        }}
      >
        <Col
          xs={{ span: 24 }}
          lg={{ span: 14 }}
          style={{
            display: 'flex',
          }}
        >
          <Flex
            vertical
            style={{
              width: '100%',
              padding: '1rem 2rem',
              border: '1px solid #164863',
              borderRadius: '.6rem',
            }}
          >
            <h1
              style={{
                marginBottom: '.8rem',
                fontWeight: '900',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              Ajouter un nouveau produit
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ChampPersonnalise
                name='name'
                errors={errors}
                label='Nom'
                register={register}
                required={true}
              />
              <ChampPersonnalise
                errors={errors}
                label='Prix'
                type='number'
                name='price'
                register={register}
                required={true}
              />
              <ChampPersonnalise
                errors={errors}
                label='Stock'
                type='number'
                name='stock'
                register={register}
                required={true}
              />
              <Row>
                <Col xs={{ span: 23 }} lg={{ span: 6 }}>
                  <label htmlFor='seller' className='label'>
                    Fournisseur
                  </label>
                </Col>
                <Col xs={{ span: 23 }} lg={{ span: 18 }}>
                  <select
                    {...register('seller', { required: true })}
                    className={`input-field ${errors['seller'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Sélectionner un fournisseur*</option>
                    {vendeurs?.data.map((item: ICategory) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>

              <Row>
                <Col xs={{ span: 23 }} lg={{ span: 6 }}>
                  <label htmlFor='category' className='label'>
                    Catégorie
                  </label>
                </Col>
                <Col xs={{ span: 23 }} lg={{ span: 18 }}>
                  <select
                    {...register('category', { required: true })}
                    className={`input-field ${errors['category'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Sélectionner une catégorie*</option>
                    {categories?.data.map((item: ICategory) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>

              <Row>
                <Col xs={{ span: 23 }} lg={{ span: 6 }}>
                  <label htmlFor='brand' className='label'>
                    Marque
                  </label>
                </Col>
                <Col xs={{ span: 23 }} lg={{ span: 18 }}>
                  <select
                    {...register('brand')}
                    className={`input-field ${errors['brand'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Sélectionner une marque</option>
                    {marques?.data.map((item: ICategory) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>

              <ChampPersonnalise label='Description' name='description' register={register} />

              <Flex justify='center'>
                <Button
                  htmlType='submit'
                  type='primary'
                  style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                >
                  Ajouter le produit
                </Button>
              </Flex>
            </form>
          </Flex>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 10 }}>
          <Flex
            vertical
            style={{
              width: '100%',
              height: '100%',
              padding: '1rem 2rem',
              border: '1px solid #164863',
              borderRadius: '.6rem',
              justifyContent: 'space-around',
            }}
          >
            <CreerVendeur />
            <CreerCategorie />
            <CreerMarque />
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default CreateProduct;
