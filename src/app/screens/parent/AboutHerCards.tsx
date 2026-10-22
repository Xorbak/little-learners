import { useState } from 'react';
import { progress, useProgress, type AboutMe } from '../../../shared/progress/store';
import { family, squarePhoto, useFamily } from '../../../shared/family';
import { ageOf, phoneWords } from '../../aboutMe';

/**
 * Grown-ups: her details for the About Me practice, and family photos for My Family.
 * Everything stays on this phone.
 */
export function AboutHerCard() {
  const saved = useProgress();
  const me: AboutMe = saved.profiles[saved.activeProfileId].aboutMe ?? {};
  const field = (key: keyof AboutMe, label: string, placeholder: string, type = 'text') => (
    <label className="parent-field">
      <span>{label}</span>
      <input
        className="parent-input"
        type={type}
        defaultValue={me[key] ?? ''}
        placeholder={placeholder}
        inputMode={type === 'tel' ? 'tel' : undefined}
        onBlur={(e) => progress.setAboutMe({ [key]: e.target.value.trim() || undefined })}
      />
    </label>
  );
  const age = ageOf(me.birthday);
  return (
    <section className="parent-card">
      <h2>About her (for “About me”)</h2>
      <p className="parent-hint">
        The NCF expects her to give her name, age, address and a contact number by Grade R. Fill in what you'd like her to practise; the “About me” game in
        All about me asks her, she says it, and then they say it together. Kept on this phone only, never sent anywhere.
      </p>
      <div className="parent-fields">
        {field('surname', 'Surname', 'e.g. Star')}
        {field('birthday', `Birthday${age !== undefined ? ` (she is ${age})` : ''}`, '', 'date')}
        {field('town', 'Suburb or town', 'e.g. Durbanville')}
        {field('street', 'Street address', 'e.g. 12 Rose Street')}
        {field('phone', 'A grown-up’s phone number', 'e.g. 082 555 1234', 'tel')}
        {field('phoneOf', 'Whose number is it?', "e.g. Mama's")}
        {field('school', 'School or crèche', 'e.g. Little Acorns')}
      </div>
      {me.phone && <p className="parent-hint">The phone number is said in little groups: “{phoneWords(me.phone)}”.</p>}
      {me.birthday && <p className="parent-hint">🎂 On her birthday, the app wishes her a happy birthday when she opens it.</p>}
    </section>
  );
}

export function FamilyCard() {
  const members = useFamily();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (file: File | undefined) => {
    if (!file) return;
    if (!name.trim()) {
      setMessage('Type the name she calls them first (e.g. Mama, Gogo, Uncle Sam).');
      return;
    }
    setBusy(true);
    try {
      const photo = await squarePhoto(file);
      const error = family.add(name, photo);
      setMessage(error ?? `Added ${name.trim()}.`);
      if (!error) setName('');
    } catch {
      setMessage("Couldn't read that picture. Try another one.");
    }
    setBusy(false);
  };

  return (
    <section className="parent-card">
      <h2>Family photos (for “My family”)</h2>
      <p className="parent-hint">
        Add a photo of each person, with the name she calls them. The game asks “Who is this?”, then “Touch Gogo!”. Photos are made small and kept on this
        phone only (they are included in backups).
      </p>
      <div className="family-list">
        {members.map((m) => (
          <div key={m.id} className="family-item">
            <img src={m.photo} alt="" />
            <input className="parent-input" defaultValue={m.name} onBlur={(e) => e.target.value.trim() && family.rename(m.id, e.target.value)} aria-label="Name" />
            <button type="button" className="parent-btn" onClick={() => family.remove(m.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="family-add">
        <input className="parent-input" value={name} placeholder="Name she calls them" onChange={(e) => setName(e.target.value)} />
        <label className={`parent-btn ${busy ? 'parent-btn--busy' : ''}`}>
          📷 Add a photo
          <input type="file" accept="image/*" hidden onChange={(e) => void add(e.target.files?.[0]).then(() => (e.target.value = ''))} />
        </label>
      </div>
      {message && <p className="parent-hint">{message}</p>}
    </section>
  );
}
