import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import './EmoteSelect.scss';
import { Popper } from '@material-ui/core';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import TwitchEmotesList from '../TwitchEmotesList/TwitchEmotesList';
import { EmoteData } from '../../models/common.model';

interface EmoteSelectProps {
  title: string;
  setEmote: (emote: EmoteData) => void;
  token: string | null;
  defaultEmote?: EmoteData;
}

const EmoteSelect: FC<EmoteSelectProps> = ({ title, setEmote, defaultEmote, token }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedEmote, setSelectedEmote] = useState<string>();
  const anchorEl = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedEmote(defaultEmote?.image);
  }, [defaultEmote]);

  const toggleEmotePicker = (): void => setOpen((prevOpen) => !prevOpen);

  const handleEmoteSelect = ({ image, code }: EmoteData): void => {
    setEmote({ image, code });
    setSelectedEmote(image);
  };

  const containerStyles: CSSProperties = {
    backgroundImage: `url(${selectedEmote})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <>
      <Popper open={open} anchorEl={anchorEl.current}>
        <TwitchEmotesList setActiveEmote={handleEmoteSelect} token={token} />
      </Popper>
      <button className="emote-select" ref={anchorEl} onClick={toggleEmotePicker} type="button" style={containerStyles}>
        {!selectedEmote && <EditOutlinedIcon />}
        <div className="emote-select-shadow" />
        <div className="emote-select-title">{title}</div>
      </button>
    </>
  );
};

export default EmoteSelect;
