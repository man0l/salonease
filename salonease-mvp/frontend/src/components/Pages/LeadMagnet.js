import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderRadius: '16px',
}));

const FormContainer = styled(Box)(({ theme }) => ({
  maxWidth: '500px',
  margin: '0 auto',
  padding: theme.spacing(4),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: 600,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1.1rem',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
  },
}));

const LeadMagnet = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'https://connect.mailerlite.com/api/subscribers',
        {
          email: formData.email,
          fields: {
            name: formData.name,
            language: i18n.language,
          },
          groups: ['98765'], // Replace with your actual group ID
          status: 'active',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_MAILERLITE_API_KEY}`,
          },
        }
      );
      
      setSnackbar({
        open: true,
        message: t('leadMagnet.form.success'),
        severity: 'success',
      });

      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('MailerLite Error:', error.response?.data || error);
      
      let errorMessage = t('leadMagnet.form.error');
      
      if (error.response?.data?.message === 'Subscriber already exists') {
        errorMessage = t('leadMagnet.form.alreadySubscribed');
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('leadMagnet.title')}
        </Typography>
        
        <Typography 
          variant="h5" 
          component="h2" 
          align="center" 
          color="primary" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {t('leadMagnet.subtitle')}
        </Typography>

        <Typography 
          variant="body1" 
          paragraph 
          align="center"
          sx={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', mb: 4 }}
        >
          {t('leadMagnet.mainDescription')}
        </Typography>

        <Box my={6}>
          <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
            {t('leadMagnet.benefits.title')}
          </Typography>
          <List>
            {t('leadMagnet.benefits.items', { returnObjects: true }).map((item, index) => (
              <StyledListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" sx={{ fontSize: '1.5rem' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={item} 
                  primaryTypographyProps={{ 
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </StyledListItem>
            ))}
          </List>
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          {t('leadMagnet.cta.title')}
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
          {t('leadMagnet.cta.subtitle')}
        </Typography>

        <FormContainer component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            {t('leadMagnet.form.title')}
          </Typography>
          <Typography 
            variant="body2" 
            align="center" 
            color="textSecondary" 
            paragraph
            sx={{ mb: 3 }}
          >
            {t('leadMagnet.form.subtitle')}
          </Typography>

          <Box mb={2}>
            <TextField
              fullWidth
              required
              name="name"
              label={t('form.fullName')}
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              required
              type="email"
              name="email"
              label={t('form.email')}
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
          </Box>

          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('leadMagnet.form.button')
            )}
          </StyledButton>

          <Typography 
            variant="caption" 
            align="center" 
            color="textSecondary" 
            sx={{ mt: 2, display: 'block' }}
          >
            {t('leadMagnet.form.disclaimer')}
          </Typography>
        </FormContainer>
      </StyledPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeadMagnet; 